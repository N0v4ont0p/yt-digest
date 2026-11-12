#!/bin/sh
# MCP_SECRET makes the endpoint URL unguessable: https://<service>.onrender.com/mcp/<MCP_SECRET>
set -e
: "${MCP_SECRET:?MCP_SECRET must be set}"
cd /app
exec supergateway \
  --stdio "ytmcp" \
  --outputTransport streamableHttp \
  --port "${PORT:-10000}" \
  --streamableHttpPath "/mcp/${MCP_SECRET}" \
  --healthEndpoint /health
