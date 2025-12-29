---
trigger: model_decision
description: Database tooling protocol. Use Neon MCP as primary tool for schema inspection, SQL execution, migrations, and performance tuning. Fallback to schema-query.js for large paginated results or CRUD form hints.
---
# Database Tooling Protocol

**Tags:** #database #neon #mcp #schema #migrations

## When this rule applies
- Any task involving database schema inspection, queries, migrations, or performance tuning
- When the AI needs to understand table structures, relationships, or constraints
- When executing SQL statements or transactions

---

## Primary Tool: Neon MCP

**Use Neon MCP tools for all database operations.**

### Discovery
Use `mcp2_list_projects` to find the project ID, then `mcp2_describe_project` for branch/database details.

### Available MCP Tools

| Tool | Purpose |
|------|---------|
| `mcp2_list_projects` | List available Neon projects |
| `mcp2_describe_project` | Get project details (branches, endpoints) |
| `mcp2_describe_branch` | Tree view of all objects (databases, schemas, tables, views, functions) |
| `mcp2_describe_table_schema` | Detailed schema for a specific table |
| `mcp2_get_database_tables` | List all tables in the database |
| `mcp2_run_sql` | Execute a single SQL statement |
| `mcp2_run_sql_transaction` | Execute multiple SQL statements as a transaction |
| `mcp2_explain_sql_statement` | Get query execution plan (EXPLAIN ANALYZE) |
| `mcp2_list_slow_queries` | Find slow queries via pg_stat_statements |
| `mcp2_prepare_database_migration` | Create migration on temp branch for safe testing |
| `mcp2_complete_database_migration` | Apply tested migration to main branch |
| `mcp2_prepare_query_tuning` | Analyze and suggest index optimizations |
| `mcp2_complete_query_tuning` | Apply tuning changes to main branch |

### Quick Start Examples

**Discover project:**
```
mcp2_list_projects to find projectId
mcp2_describe_project with projectId to get branch details
```

**Get table details:**
```
mcp2_describe_table_schema with projectId, tableName
```

**Run a query:**
```
mcp2_run_sql with projectId, sql: "SELECT * FROM table_name LIMIT 10"
```

---

## Fallback Tool: schema-query.js

**Use .windsurf/tools/schema-query.js only when:**
1. **Large result sets** - MCP has no output size management; schema-query.js respects 7,800 byte limit with auto-pagination
2. **Form generation hints** - schema-query.js provides specialized AI hints for CRUD form generation (dropdown sources, required fields, etc.)
3. **Paginated browsing** - When you need to page through many tables or large query results

### Fallback Usage
```bash
# Schema index with pagination
cmd /c node .windsurf\tools\schema-query.js --index

# Specific table with form hints
cmd /c node .windsurf\tools\schema-query.js --table table_name

# Large query with pagination
cmd /c node .windsurf\tools\schema-query.js --sql "SELECT * FROM large_table" --page 1 --page-size 20
```

---

## Decision Tree

```
Need database info?
├── Schema inspection (tables, columns, relationships)
│   └── Use: mcp2_describe_table_schema or mcp2_describe_branch
├── Execute SQL query
│   ├── Small result set expected → Use: mcp2_run_sql
│   └── Large result set (100+ rows) → Use: schema-query.js --sql
├── Database migration
│   └── Use: mcp2_prepare_database_migration → test → mcp2_complete_database_migration
├── Query performance
│   ├── Explain plan → Use: mcp2_explain_sql_statement
│   ├── Find slow queries → Use: mcp2_list_slow_queries
│   └── Index optimization → Use: mcp2_prepare_query_tuning workflow
└── CRUD form generation
    └── Use: schema-query.js --table (for form hints)
```

---

## Migration Workflow (Safe Pattern)

1. **Prepare:** `mcp2_prepare_database_migration` creates a temp branch
2. **Test:** Run validation queries on temp branch using `mcp2_run_sql` with the temp `branchId`
3. **Complete:** `mcp2_complete_database_migration` applies to production

**Never run DDL directly on production branch without this workflow.**

---

## Performance Analysis Notes

- Ensure `pg_stat_statements` extension is installed before using `mcp2_list_slow_queries`
- Allow 24-48h of normal app usage after enabling for meaningful slow query results
