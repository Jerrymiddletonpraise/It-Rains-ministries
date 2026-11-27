#!/usr/bin/env bash
# Applies every migration to a throwaway local Postgres (with small Supabase stand-ins)
# and runs the Row Level Security checks. Usage: PGHOST=... PGPORT=... PGUSER=postgres ./supabase/tests/run.sh
set -euo pipefail
cd "$(dirname "$0")/.."
psql -q -c 'drop database if exists gcc_rls_test' -c 'create database gcc_rls_test'
cat tests/00_supabase_stubs.sql migrations/*.sql | psql -q -d gcc_rls_test -v ON_ERROR_STOP=1
psql -At -d gcc_rls_test -f tests/rls_checks.sql | grep -E '^ok|PASSED'
