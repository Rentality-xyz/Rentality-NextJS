#!/bin/sh
set -e

echo
while ! nc -z graph-node 8020; do
  echo 
  sleep 1
done

echo "[entrypoint] ✅ Graph Node доступен, запускаем Graph CLI…"

echo "[1/4] Запуск: graph codegen"
graph codegen
echo "[1/4] ✅ codegen завершён"

echo "[2/4] Запуск: graph build"
graph build
echo "[2/4] ✅ build завершён"

echo "[3/4] Запуск: graph create --node http://graph-node:8020/ gateway"
graph create --node http://graph-node:8020/ gateway
echo "[3/4] ✅ Subgraph «gateway» создан (graph create)"

echo "[4/4] Запуск: graph deploy --node http://graph-node:8020/ gateway"
graph deploy --node http://graph-node:8020/ --version-label v0.0.1 gateway
echo "[4/4] ✅ Subgraph «gateway» задеплоен (graph deploy)"


