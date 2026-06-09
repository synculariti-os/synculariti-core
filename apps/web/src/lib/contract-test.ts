import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

interface OpenAPISpec {
  openapi: string;
  paths: Record<string, Record<string, Operation>>;
  components?: {
    schemas?: Record<string, any>;
    securitySchemes?: Record<string, any>;
  };
  tags?: Array<{ name: string; description: string }>;
}

interface Operation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
  security?: Array<Record<string, string[]>>;
}

interface Parameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  schema?: any;
  description?: string;
}

interface RequestBody {
  description?: string;
  content: Record<string, MediaType>;
  required?: boolean;
}

interface MediaType {
  schema?: any;
  example?: any;
}

interface Response {
  description: string;
  content?: Record<string, MediaType>;
}

let cachedSpec: OpenAPISpec | null = null;

function loadSpec(): OpenAPISpec {
  if (cachedSpec) return cachedSpec;
  
  const specPath = join(process.cwd(), 'openapi-spec.json');
  const specContent = readFileSync(specPath, 'utf-8');
  cachedSpec = JSON.parse(specContent);
  return cachedSpec!;
}

function resolveSchema(schema: any, components: any): any {
  if (!schema) return z.any();
  
  if (schema.$ref) {
    const refPath = schema.$ref.split('/').slice(1);
    let resolved = components;
    for (const part of refPath) {
      resolved = resolved?.[part];
    }
    return resolveSchema(resolved, components);
  }
  
  if (schema.allOf) {
    const schemas = schema.allOf.map((s: any) => resolveSchema(s, components));
    return schemas.reduce((acc: any, schema: any) => z.intersection(acc, schema));
  }
  
  if (schema.oneOf) {
    return z.union(schema.oneOf.map((s: any) => resolveSchema(s, components)));
  }
  
  if (schema.anyOf) {
    return z.union(schema.anyOf.map((s: any) => resolveSchema(s, components)));
  }
  
  switch (schema.type) {
    case 'string':
      if (schema.enum) {
        return z.enum(schema.enum);
      }
      let strSchema = z.string();
      if (schema.format === 'uuid') strSchema = strSchema.uuid();
      if (schema.format === 'date-time') strSchema = strSchema.datetime();
      if (schema.format === 'email') strSchema = strSchema.email();
      if (schema.minLength) strSchema = strSchema.min(schema.minLength);
      if (schema.maxLength) strSchema = strSchema.max(schema.maxLength);
      return strSchema;
      
    case 'number':
    case 'integer':
      let numSchema = schema.type === 'integer' ? z.number().int() : z.number();
      if (schema.minimum !== undefined) numSchema = numSchema.min(schema.minimum);
      if (schema.maximum !== undefined) numSchema = numSchema.max(schema.maximum);
      if (schema.multipleOf !== undefined) numSchema = numSchema.multipleOf(schema.multipleOf);
      return numSchema;
      
    case 'boolean':
      return z.boolean();
      
    case 'array':
      return z.array(resolveSchema(schema.items, components));
      
    case 'object':
      const shape: Record<string, any> = {};
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          shape[key] = resolveSchema(propSchema as any, components);
        }
      }
      if (schema.additionalProperties === false) {
        return z.object(shape).strict();
      }
      return z.object(shape);
      
    default:
      return z.any();
  }
}

function getResponseSchema(operation: Operation, statusCode: string, components: any): any {
  const response = operation.responses[statusCode];
  if (!response?.content) return z.any();
  
  const mediaType = Object.values(response.content)[0];
  if (!mediaType?.schema) return z.any();
  
  return resolveSchema(mediaType.schema, components);
}

function getRequestBodySchema(operation: Operation, components: any): any {
  if (!operation.requestBody?.content) return z.any();
  
  const mediaType = Object.values(operation.requestBody.content)[0];
  if (!mediaType?.schema) return z.any();
  
  return resolveSchema(mediaType.schema, components);
}

export function createContractTest(path: string, method: string) {
  const spec = loadSpec();
  const pathKey = Object.keys(spec.paths).find(p => {
    const regex = p.replace(/\{([^}]+)\}/g, '([^/]+)');
    return new RegExp(`^${regex}$`).test(path);
  });
  
  if (!pathKey) {
    throw new Error(`No matching path found for ${path}`);
  }
  
  const operation = spec.paths[pathKey][method.toLowerCase()];
  if (!operation) {
    throw new Error(`No ${method} operation found for ${path}`);
  }
  
  const components = spec.components;
  
  return {
    spec,
    operation,
    path: pathKey,
    method: method.toLowerCase(),
    
    validateResponse(statusCode: string, data: any) {
      const schema = getResponseSchema(operation, statusCode, components);
      return schema.safeParse(data);
    },
    
    validateRequest(data: any) {
      const schema = getRequestBodySchema(operation, components);
      return schema.safeParse(data);
    },
    
    getResponseSchema(statusCode: string) {
      return getResponseSchema(operation, statusCode, components);
    },
    
    getRequestBodySchema() {
      return getRequestBodySchema(operation, components);
    },
    
    getOperation() {
      return operation;
    },
    
    getPathParams(path: string): Record<string, string> {
      const regex = pathKey.replace(/\{([^}]+)\}/g, '([^/]+)');
      const match = path.match(new RegExp(`^${regex}$`));
      if (!match) return {};
      
      const paramNames = pathKey.match(/\{([^}]+)\}/g)?.map(p => p.slice(1, -1)) || [];
      const params: Record<string, string> = {};
      paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });
      return params;
    }
  };
}

export { loadSpec, resolveSchema };
export type { OpenAPISpec, Operation };