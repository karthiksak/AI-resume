import { createServer } from "http";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  CHENNAI_HIRING_TRENDS,
  buildOptimizedResume,
  extractKeywords,
  generateHrInterview,
  generateTechnicalInterview,
  scoreResume
} from "./src/engine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const port = process.env.PORT || 3000;

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify(payload));
}

async function parseBody(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

async function serveFile(res, filePath, contentType) {
  const data = await readFile(filePath);
  res.writeHead(200, { "Content-Type": contentType });
  res.end(data);
}

createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  try {
    if (req.url === "/api/health") return sendJson(res, 200, { status: "ok" });

    if (req.url === "/api/trends" && req.method === "GET") {
      return sendJson(res, 200, CHENNAI_HIRING_TRENDS);
    }

    if (req.url === "/api/keywords" && req.method === "POST") {
      const body = await parseBody(req);
      return sendJson(res, 200, extractKeywords(body.jobDescription));
    }

    if (req.url === "/api/optimize" && req.method === "POST") {
      const body = await parseBody(req);
      const keywords = extractKeywords(body.jobDescription).technicalKeywords;
      const optimized = buildOptimizedResume({
        platform: body.platform,
        resumeText: body.resumeText,
        level: body.level,
        role: body.role,
        keywords,
        location: body.location || "Chennai"
      });
      return sendJson(res, 200, optimized);
    }

    if (req.url === "/api/score" && req.method === "POST") {
      const body = await parseBody(req);
      return sendJson(res, 200, scoreResume(body));
    }

    if (req.url === "/api/interview/technical" && req.method === "POST") {
      const body = await parseBody(req);
      return sendJson(res, 200, generateTechnicalInterview(body));
    }

    if (req.url === "/api/interview/hr" && req.method === "POST") {
      const body = await parseBody(req);
      return sendJson(res, 200, generateHrInterview(body.answers));
    }

    if (req.url === "/" || req.url === "/index.html") {
      return await serveFile(res, path.join(publicDir, "index.html"), "text/html");
    }

    if (req.url === "/styles.css") {
      return await serveFile(res, path.join(publicDir, "styles.css"), "text/css");
    }

    if (req.url === "/app.js") {
      return await serveFile(res, path.join(publicDir, "app.js"), "text/javascript");
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    sendJson(res, 500, { error: "Server error", details: error.message });
  }
}).listen(port, () => {
  console.log(`AI Resume & Interview Coach running on http://localhost:${port}`);
});
