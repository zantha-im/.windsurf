---
trigger: model_decision
description: Database tooling protocol. Use Neon MCP as the exclusive tool for schema inspection, SQL execution, migrations, and performance tuning.
---
# Database Tooling Protocol

**Tags:** #database #neon #mcp #schema #migrations

## When this rule applies
- Any task involving database schema inspection, queries, migrations, or performance tuning
- When the AI needs to understand table structures, relationships, or constraints
- When executing SQL statements or transactions

---

## Exclusive Tool: Neon MCP

**Use Neon MCP tools for ALL database operations. NEVER write ad-hoc Node.js scripts for database access.**

### Discovery
Use `mcp1_list_projects` to find the project ID, then `mcp1_describe_project` for branch/database details.

### Available MCP Tools

| Tool | Purpose |
|------|---------|
| `mcp1_list_projects` | List available Neon projects |
| `mcp1_describe_project` | Get project details (branches, endpoints) |
| `mcp1_describe_branch` | Tree view of all objects (databases, schemas, tables, views, functions) |
| `mcp1_describe_table_schema` | Detailed schema for a specific table |
| `mcp1_get_database_tables` | List all tables in the database |
| `mcp1_run_sql` | Execute a single SQL statement |
| `mcp1_run_sql_transaction` | Execute multiple SQL statements as a transaction |
| `mcp1_explain_sql_statement` | Get query execution plan (EXPLAIN ANALYZE) |
| `mcp1_list_slow_queries` | Find slow queries via pg_stat_statements |
| `mcp1_prepare_database_migration` | Create migration on temp branch for safe testing |
| `mcp1_complete_database_migration` | Apply tested migration to main branch |
| `mcp1_prepare_query_tuning` | Analyze and suggest index optimizations |
| `mcp1_complete_query_tuning` | Apply tuning changes to main branch |

### Quick Start Examples

**Discover project:**
`
mcp1_list_projects to find projectId
mcp1_describe_project with projectId to get branch details
`

**Get table details:**
`
mcp1_describe_table_schema with projectId, tableName
`

**Run a query:**
`
mcp1_run_sql with projectId, sql: "SELECT * FROM table_name LIMIT 10"
`

**Browse all tables:**
`
mcp1_get_database_tables with projectId
`

---

## Decision Tree

`
Need database info?
+-- Schema inspection (tables, columns, relationships)
|   +-- Use: mcp1_describe_table_schema or mcp1_describe_branch
+-- List all tables
|   +-- Use: mcp1_get_database_tables
+-- Execute SQL query
|   +-- Use: mcp1_run_sql (any result size)
+-- Execute multiple SQL statements
|   +-- Use: mcp1_run_sql_transaction
+-- Database migration
|   +-- Use: mcp1_prepare_database_migration -> test -> mcp1_complete_database_migration
+-- Query performance
|   +-- Explain plan -> Use: mcp1_explain_sql_statement
|   +-- Find slow queries -> Use: mcp1_list_slow_queries
|   +-- Index optimization -> Use: mcp1_prepare_query_tuning workflow
+-- CRUD form generation
    +-- Use: mcp1_describe_table_schema (inspect columns, constraints, foreign keys)
`

---

## Migration Workflow (Safe Pattern)

1. **Prepare:** `mcp1_prepare_database_migration` creates a temp branch
2. **Test:** Run validation queries on temp branch using `mcp1_run_sql` with the temp `branchId`
3. **Complete:** `mcp1_complete_database_migration` applies to production

**Never run DDL directly on production branch without this workflow.**

---

## Performance Analysis Notes

- Ensure `pg_stat_statements` extension is installed before using `mcp1_list_slow_queries`
- Allow 24-48h of normal app usage after enabling for meaningful slow query results


