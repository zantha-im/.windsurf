---
trigger: model_decision
description: Database tooling protocol. Use Neon MCP as the exclusive tool for schema inspection, SQL execution, migrations, and performance tuning.
---
# Database Tooling Protocol

**Tags:** #database #neon #mcp #schema #migrations

## When this rule applies
- Any task involving database schema inspection, queries, migrations, or performance tuning

---

## First Step: Verify Connection

**Before ANY database operation, you MUST:**

1. Run `mcp2_list_projects` to confirm MCP is connected and retrieve available projects
2. Run `mcp2_describe_project` with the target `projectId` to get database/branch details
3. **Confirm to the user:** "Connected to Neon project: **[project name]**"

If `mcp2_list_projects` fails, the Neon MCP server is not connected. Do NOT fall back to scripts - inform the user that MCP connection is required.

---

## Core Constraint

**Use Neon MCP tools for ALL database operations. Ad-hoc scripts for database access are strictly prohibited.**

---

## Decision Tree

```
Need database info?
├── Schema inspection (tables, columns, relationships)
│   └── Use: mcp2_describe_table_schema or mcp2_describe_branch
├── List all tables
│   └── Use: mcp2_get_database_tables
├── Execute SQL query
│   └── Use: mcp2_run_sql
├── Execute multiple SQL statements
│   └── Use: mcp2_run_sql_transaction
├── Database migration
│   └── Use: prepare → test → complete workflow (see below)
└── Query performance
    ├── Explain plan → mcp2_explain_sql_statement
    ├── Find slow queries → mcp2_list_slow_queries
    └── Index optimization → mcp2_prepare_query_tuning workflow
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
