#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  DROP DATABASE IF EXISTS "graph-node";
  CREATE DATABASE "graph-node" WITH TEMPLATE=template0 ENCODING='UTF8' LC_COLLATE='C' LC_CTYPE='C';
EOSQL