# Role-Based Playwright Workflows

> Per-role test matrices for E2E Playwright specs. Each row = one workflow test.

---

## Legend

| Badge | Meaning |
|---|---|
| ✅ Nav visible | Sidebar section/link is visible |
| 🚫 Nav hidden | Sidebar section/link is hidden |
| ✅ Page 200 | Direct URL loads without error |
| 🚫 403 | Direct URL returns 403 or redirects |
| ✅ Form action | Can submit create/edit forms |
| 🚫 No form | Form buttons are hidden or disabled |
| 🔶 Edge case | Special behavior to verify |

---

## Administrator

**Permissions:** All 12 (ADMIN.TENANTS, ADMIN.ROLES, ADMIN.USERS, REPORTING.READ, INVENTORY.READ/WRITE/COUNT, PROCUREMENT.READ/WRITE, RECIPE.READ/WRITE, SALES.IMPORT)

**Spec:** `admin-workflows.spec.ts`

| # | Workflow | Steps | Assertions |
|---|---|---|---|
| W1 | Dashboard loads | Navigate `/dashboard` | Stats cards visible, par alerts section renders |
| W2 | Items — full CRUD | List → Create item → Verify in list → Edit → Delete | Toast "Item created", item visible in table, toast "Item deleted", removed from list |
| W3 | Categories — CRUD | List → Create category → Edit → Delete | Category appears, persists after edit, removed |
| W4 | Stock Levels | Navigate `/inventory` | Table renders with quantity + par level per item |
| W5 | Transfer create + complete | Fill transfer form → Submit → Complete | Transfer shows in list, status transitions DRAFT→COMPLETED |
| W6 | Count lifecycle | Start batch → Submit actual qty (2 rows) → Close batch | Batch status OPEN→CLOSED, ledger receives adjustment entry |
| W7 | Waste log | Fill waste form → Submit | Waste entry visible in list, stock reduced in ledger |
| W8 | Prep production | Fill prep form → Submit | Prep entry visible in list, ingredients consumed in ledger |
| W9 | Ledger pagination | View ledger → Page through entries | Entries display reason code + change amount + timestamp |
| W10 | Vendors CRUD | List → Create → Edit → Bulk-delete | Vendor created, edit persists, bulk-delete removes all |
| W11 | PO lifecycle | Create draft → Submit → Receive | Status transitions DRAFT→SUBMITTED→RECEIVED, batch created |
| W12 | Cancel PO (draft) | Create draft → Cancel | Status becomes CANCELLED |
| W13 | Cancel PO (submitted) | Create draft → Submit → Cancel | Status becomes CANCELLED |
| W14 | Recipes — create with ingredients | Fill recipe form → Add ingredients → Submit | Recipe appears in BOM list, ingredients editable |
| W15 | Recipes — edit yield | Edit recipe → Change yield → Save | Yield updated, ingredient quantities recalculated |
| W16 | Recipes — delete | Delete recipe | Removed from list, cascade deletes ingredients |
| W17 | POS Mappings — create | Select recipe → Map POS string → Save | Mapping appears in list |
| W18 | POS Mappings — delete | Delete mapping | Removed from list |
| W19 | Sales import | Upload file → Confirm processing | Batch created with status PENDING→PROCESSING |
| W20 | Sales import history | Navigate sales page | Batch history list renders |
| W21 | Reports — Variance | Navigate `/reports/variance` | Variance table renders with expected vs actual |
| W22 | Reports — Snapshots | Navigate `/reports/snapshots` | Daily snapshot cards render |
| W23 | Reports — Par Alerts | Navigate `/reports/par-alerts` | Items below par level highlighted |
| W24 | Admin — Franchise Groups CRUD | List → Create → Edit | FG created, persists after edit |
| W25 | Admin — Restaurants CRUD | List → Create → Edit | Restaurant created, linked to FG |
| W26 | Admin — Roles CRUD | List → Create → Edit → Delete | Role created with permissions |
| W27 | Admin — Permissions view | Navigate permissions page | All permission codes listed |
| W28 | Admin — User Assignments | Assign role to user → Verify | Assignment visible in list |
| W29 | Admin — Audit Logs | Navigate audit logs | Paginated log entries visible |

---

## Restaurant Manager

**Permissions:** `PROCUREMENT.WRITE`, `SALES.IMPORT`, `INVENTORY.READ/WRITE`, `RECIPE.READ`

**Spec:** `restaurant-manager-workflows.spec.ts`

| # | Workflow | Steps | Assertions |
|---|---|---|---|
| W1 | Items — create + edit | Create item → Edit | Same as Admin W2 |
| W2 | Items — Categories | List categories | Categories visible |
| W3 | Stock Levels | View stock | Same as Admin W4 |
| W4 | Transfer create + complete | Same as Admin W5 | Same |
| W5 | Waste log | Same as Admin W7 | Same |
| W6 | Prep production | Same as Admin W8 | Same |
| W7 | Ledger | View ledger entries | Same as Admin W9 |
| W8 | Recipes | View BOM list | Recipes visible (no create/edit buttons) |
| W9 | POS Mappings | View mappings list | Mappings visible (no create/delete buttons) |
| W10 | Sales import | Upload file → Confirm | Same as Admin W19 |
| **DENIED** | | | |
| D1 | Dashboard | `/dashboard` | 🚫 403 |
| D2 | Procurement nav | Sidebar | 🚫 Nav hidden (has WRITE but not READ) |
| D3 | Vendors page | `/procurement/vendors` | 🚫 403 |
| D4 | Purchase Orders page | `/procurement/orders` | 🚫 403 |
| D5 | Reports | `/reports/variance` | 🚫 403 |
| D6 | Admin | `/admin/roles` | 🚫 403 |

---

## Inventory Operator

**Permissions:** `INVENTORY.READ`, `INVENTORY.COUNT`

**Spec:** `inventory-operator-workflows.spec.ts`

| # | Workflow | Steps | Assertions |
|---|---|---|---|
| W1 | Stock Levels | View stock | Table renders with quantities |
| W2 | Count — start batch | Click "Start Count" | Batch created with OPEN status |
| W3 | Count — submit row | Enter actual qty → Submit | Row updated, discrepancy calculated |
| W4 | Count — close batch | Click "Close Batch" | Status→CLOSED, ledger adjustment created |
| W5 | Ledger | View entries | Paginated entries visible |
| **DENIED** | | | |
| D1 | Transfers | `/inventory/transfers` | 🚫 Nav hidden, 403 |
| D2 | Waste | `/inventory/waste` | 🚫 Nav hidden, 403 |
| D3 | Prep Production | `/inventory/prep` | 🚫 Nav hidden, 403 |
| D4 | Procurement | All procurement pages | 🚫 403 |
| D5 | Recipes | All recipe pages | 🚫 403 |
| D6 | Sales | `/sales/import` | 🚫 403 |
| D7 | Reports | `/reports/variance` | 🚫 403 |
| D8 | Admin | `/admin/roles` | 🚫 403 |

---

## Procurement Specialist

**Permissions:** `PROCUREMENT.READ/WRITE`

**Spec:** `procurement-workflows.spec.ts`

| # | Workflow | Steps | Assertions |
|---|---|---|---|
| W1 | Vendors — list | Navigate `/procurement/vendors` | Vendor list renders |
| W2 | Vendors — create | Fill create form → Submit | Vendor appears in list |
| W3 | Vendors — edit | Edit vendor → Save | Changes persist |
| W4 | Vendors — bulk-delete | Select vendors → Delete | Removed from list |
| W5 | POs — list | Navigate `/procurement/orders` | PO list renders with status badges |
| W6 | PO — create draft | Select vendor + items → Create | PO created with DRAFT status |
| W7 | PO — submit | Submit draft PO | Status→SUBMITTED |
| W8 | PO — receive | Receive submitted PO | Status→RECEIVED, batch + ledger created |
| W9 | PO — cancel (draft) | Cancel draft PO | Status→CANCELLED |
| W10 | PO — cancel (submitted) | Cancel submitted PO | Status→CANCELLED |
| **DENIED** | | | |
| D1 | Dashboard | `/dashboard` | 🚫 403 |
| D2 | Items | `/items` | 🚫 403 |
| D3 | Inventory | All inventory pages | 🚫 403 |
| D4 | Recipes | `/recipes` | 🚫 403 |
| D5 | Sales | `/sales/import` | 🚫 403 |
| D6 | Reports | `/reports/variance` | 🚫 403 |
| D7 | Admin | `/admin/roles` | 🚫 403 |

---

## Franchise Manager

**Permissions:** `PROCUREMENT.READ`

**Spec:** `franchise-manager-workflows.spec.ts`

| # | Workflow | Steps | Assertions |
|---|---|---|---|
| W1 | Vendors — list | Navigate `/procurement/vendors` | Table renders (no create/edit buttons) |
| W2 | POs — list | Navigate `/procurement/orders` | PO list renders (no submit/receive/cancel buttons) |
| W3 | PO — view detail | Click PO | Detail view renders read-only |
| **DENIED** | | | |
| D1 | Vendor create | Check for create button | 🚫 Button not visible |
| D2 | PO create | Check for create button | 🚫 Button not visible |
| D3 | All other sections | All non-procurement URLs | 🚫 403 |

---

## Accountant

**Permissions:** `REPORTING.READ`, `ADMIN.USERS`

**Spec:** `accountant-workflows.spec.ts`

| # | Workflow | Steps | Assertions |
|---|---|---|---|
| W1 | Dashboard | Navigate `/dashboard` | Stats cards visible (has REPORTING.READ) |
| W2 | Variance Analysis | Navigate `/reports/variance` | Variance table renders |
| W3 | Snapshots | Navigate `/reports/snapshots` | Daily snapshot data visible |
| W4 | Par Alerts | Navigate `/reports/par-alerts` | Items below par highlighted |
| W5 | Audit Logs (direct URL) | Navigate `/admin/audit-logs` | Paginated log entries visible (page gate checks ADMIN.USERS) |
| W6 | User Assignments (direct URL) | Navigate `/admin/assignments` | Assignment list visible, read-only (page gate checks ADMIN.USERS) |
| **DENIED** | | | |
| D1 | Items | `/items` | 🚫 403 |
| D2 | Inventory | All inventory pages | 🚫 403 |
| D3 | Procurement | All procurement pages | 🚫 403 |
| D4 | Recipes | `/recipes` | 🚫 403 |
| D5 | Sales | `/sales/import` | 🚫 403 |
| D6 | Admin nav | Sidebar | 🚫 Nav hidden (section gate = ADMIN.TENANTS) |
| D7 | Admin — Franchise Groups | `/admin/franchise-groups` | 🚫 403 (no ADMIN.TENANTS) |
| D8 | Admin — Roles | `/admin/roles` | 🚫 403 (no ADMIN.ROLES) |
| D9 | Admin — Permissions | `/admin/permissions` | 🚫 403 (no ADMIN.ROLES) |

---

## Unknown (No Permissions)

**Permissions:** (none)

**Spec:** `denied-access.spec.ts`

| # | URL | Expected |
|---|---|---|
| D1 | `/dashboard` | 🚫 Redirect to `/login` or 403 |
| D2 | `/items` | 🚫 Redirect or 403 |
| D3 | `/items/categories` | 🚫 Redirect or 403 |
| D4 | `/inventory` | 🚫 Redirect or 403 |
| D5 | `/inventory/transfers` | 🚫 Redirect or 403 |
| D6 | `/inventory/counts` | 🚫 Redirect or 403 |
| D7 | `/inventory/waste` | 🚫 Redirect or 403 |
| D8 | `/inventory/prep` | 🚫 Redirect or 403 |
| D9 | `/inventory/ledger` | 🚫 Redirect or 403 |
| D10 | `/procurement/vendors` | 🚫 Redirect or 403 |
| D11 | `/procurement/orders` | 🚫 Redirect or 403 |
| D12 | `/recipes` | 🚫 Redirect or 403 |
| D13 | `/recipes/mappings` | 🚫 Redirect or 403 |
| D14 | `/sales/import` | 🚫 Redirect or 403 |
| D15 | `/reports/variance` | 🚫 Redirect or 403 |
| D16 | `/reports/snapshots` | 🚫 Redirect or 403 |
| D17 | `/reports/par-alerts` | 🚫 Redirect or 403 |
| D18 | `/admin/franchise-groups` | 🚫 Redirect or 403 |
| D19 | `/admin/restaurants` | 🚫 Redirect or 403 |
| D20 | `/admin/roles` | 🚫 Redirect or 403 |
| D21 | `/admin/permissions` | 🚫 Redirect or 403 |
| D22 | `/admin/assignments` | 🚫 Redirect or 403 |
| D23 | `/admin/audit-logs` | 🚫 Redirect or 403 |
