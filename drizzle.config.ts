// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
    dialect: "sqlite",
    schema: './src/drizzle/schema.ts',
    out: './drizzle/migrations',
    driver: 'durable-sqlite',
} satisfies Config;
