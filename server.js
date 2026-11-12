// Streamable HTTP wrapper for @mrsknetwork/ytmcp.
// Loads the tool modules once at boot, then builds a fresh MCP server per request
// (stateless), so each request answers in milliseconds instead of spawning a process.
const path = require("path");
const express = require("express");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");

const SECRET = process.env.MCP_SECRET;
if (!SECRET) { console.error("MCP_SECRET must be set"); process.exit(1); }

const toolsDir = path.join(path.dirname(require.resolve("@mrsknetwork/ytmcp/package.json")), "build/server/tools");
const t = (f) => require(path.join(toolsDir, f));
const registrars = [
  t("search.js").registerSearchTools,
  t("videos.js").registerVideoTools,
  t("channels.js").registerChannelTools,
  t("playlists.js").registerPlaylistTools,
  t("comments.js").registerCommentTools,
  t("i18n.js").registerI18nTools,
];

function buildServer() {
  const server = new McpServer({ name: "yt-digest", version: "1.0.0" });
  for (const register of registrars) register(server);
  return server;
}

const app = express();
app.use(express.json({ limit: "4mb" }));
app.get("/health", (_req, res) => res.send("ok"));

const route = `/mcp/${SECRET}`;
app.post(route, async (req, res) => {
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on("close", () => { transport.close(); server.close(); });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("MCP request failed:", err);
    if (!res.headersSent) res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null });
  }
});
app.all(route, (_req, res) => res.status(405).set("Allow", "POST").end());

const port = process.env.PORT || 10000;
app.listen(port, () => console.error(`yt-digest MCP listening on ${port}`));
