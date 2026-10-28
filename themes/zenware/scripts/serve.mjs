// Local stand-in for Cloudflare Pages: gzip plus the CSP from _headers, so Lighthouse sees roughly what production serves.
// Usage: node serve.mjs <public-dir>   (serves on http://localhost:4173)
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import zlib from "node:zlib";
const root = process.argv[2], port = 4173;
// parse the CSP from _headers (/* and exact-path overrides); drop upgrade-insecure-requests for http://localhost
const rules = {}; let cur = null;
for (const line of fs.readFileSync(path.join(root, "_headers"), "utf8").split("\n")) {
  if (/^\S/.test(line) && !line.startsWith("#")) cur = rules[line.trim()] = {};
  else if (cur && /^\s+Content-Security-Policy:/.test(line)) cur.csp = line.split(/:\s(.+)/)[1].replace(/;\s*upgrade-insecure-requests/, "");
}
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2", ".xml": "application/xml", ".svg": "image/svg+xml" };
http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split("?")[0]);
  let f = path.join(root, u); if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(fs.readFileSync(path.join(root, "404.html"))); }
  const csp = (rules[u] || rules["/*"]).csp;
  const body = zlib.gzipSync(fs.readFileSync(f));
  res.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream", "Content-Encoding": "gzip", "Content-Security-Policy": csp, "Cache-Control": "max-age=604800", "X-Content-Type-Options": "nosniff" });
  res.end(body);
}).listen(port, () => console.log("serving", root, "on", port));
