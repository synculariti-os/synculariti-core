import neo4j, { Driver, Session } from 'neo4j-driver';
import type { TransactionSyncPayload } from './types';

let driver: Driver | null = null;

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || '';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || '';

export function getNeo4jDriver(): Driver | null {
  if (driver) return driver;
  try {
    if (NEO4J_USER && NEO4J_PASSWORD) {
      driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
    } else {
      driver = neo4j.driver(NEO4J_URI);
    }
    return driver;
  } catch {
    return null;
  }
}

export async function neo4jBulkMerge(
  transactions: TransactionSyncPayload[],
  session: Session,
): Promise<number> {
  let synced = 0;
  for (const tx of transactions) {
    await session.executeWrite(async (txn) => {
      // Merge Transaction node
      await txn.run(
        `MERGE (t:Transaction {tx_id: $txId})
         SET t.tenant_id = $tenantId,
             t.amount = $amount,
             t.transaction_date = $date,
             t.category = $category,
             t.day_of_week = $dayOfWeek,
             t.is_weekend = $isWeekend,
             t.month = $month,
             t.quarter = $quarter
         `,
        {
          txId: tx.txId,
          tenantId: tx.tenantId,
          amount: tx.amount,
          date: tx.transaction_date,
          category: tx.category || null,
          dayOfWeek: tx.dayOfWeek,
          isWeekend: tx.isWeekend,
          month: tx.month,
          quarter: tx.quarter,
        },
      );

      // Merge Merchant node
      await txn.run(
        `MERGE (m:Merchant {merchant_id: $merchantId})
         SET m.name = $vendorName,
             m.tenant_id = $tenantId
         `,
        { merchantId: tx.merchantId, vendorName: tx.vendorName, tenantId: tx.tenantId },
      );

      // MERGE Transaction -[:PROCESSED_BY]-> Merchant
      await txn.run(
        `MATCH (t:Transaction {tx_id: $txId})
         MATCH (m:Merchant {merchant_id: $merchantId})
         MERGE (m)-[:PROCESSED]->(t)
         `,
        { txId: tx.txId, merchantId: tx.merchantId },
      );

      // Process each line item
      for (const item of tx.items) {
        // Merge MerchantSKU node
        await txn.run(
          `MERGE (sku:MerchantSKU {sku_id: $skuId})
           SET sku.merchant_id = $merchantId,
               sku.raw_name = $itemName,
               sku.unit_price = $unitPrice,
               sku.currency = $currency
           `,
          {
            skuId: item.skuId,
            merchantId: tx.merchantId,
            itemName: item.itemName,
            unitPrice: item.itemUnitPrice,
            currency: item.currency,
          },
        );

        // Merge Ingredient node
        await txn.run(
          `MERGE (i:Ingredient {ingredient_id: $ingredientId})
           SET i.name = $canonicalName,
               i.base_unit = $baseUnit,
               i.perishability_days = $perishability
           `,
          {
            ingredientId: item.canonicalIngredientId,
            canonicalName: item.canonicalName,
            baseUnit: item.baseUnit,
            perishability: item.perishability,
          },
        );

        // MERGE Transaction -[:CONTAINS]-> MerchantSKU
        await txn.run(
          `MATCH (t:Transaction {tx_id: $txId})
           MATCH (sku:MerchantSKU {sku_id: $skuId})
           MERGE (t)-[:CONTAINS]->(sku)
           `,
          { txId: tx.txId, skuId: item.skuId },
        );

        // MERGE MerchantSKU -[:IS_INSTANCE_OF]-> Ingredient
        await txn.run(
          `MATCH (sku:MerchantSKU {sku_id: $skuId})
           MATCH (i:Ingredient {ingredient_id: $ingredientId})
           MERGE (sku)-[:IS_INSTANCE_OF]->(i)
           `,
          { skuId: item.skuId, ingredientId: item.canonicalIngredientId },
        );
      }
    });
    synced++;
  }
  return synced;
}

export async function closeNeo4jDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
