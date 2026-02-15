import { createServer } from "http";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildAdvancedResumePack,
  extractKeywords,
  generateStudentResume,
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

function sendTextDownload(res, filename, text, mime) {
  res.writeHead(200, {
    "Content-Type": mime,
    "Content-Disposition": `attachment; filename=\"${filename}\"`,
    "Access-Control-Allow-Origin": "*"
  });
  res.end(text);
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

    if (req.url === "/api/keywords" && req.method === "POST") {
      const body = await parseBody(req);
      return sendJson(res, 200, extractKeywords(body.jobDescription));
    }

    if (req.url === "/api/score" && req.method === "POST") {
      const body = await parseBody(req);
      return sendJson(res, 200, scoreResume(body));
    }

    if (req.url === "/api/student-resume" && req.method === "POST") {
      const body = await parseBody(req);
      return sendJson(res, 200, { resumeText: generateStudentResume(body) });
    }

    if (req.url === "/api/advanced-resume-pack" && req.method === "POST") {
      const body = await parseBody(req);
      return sendJson(res, 200, buildAdvancedResumePack(body));
    }

    if (req.url === "/api/export/doc" && req.method === "POST") {
      const body = await parseBody(req);
      const htmlDoc = `<!doctype html><html><body><pre style="font-family:Calibri,Arial,sans-serif;white-space:pre-wrap;">${(body.text || "").replace(/</g, "&lt;")}</pre></body></html>`;
      return sendTextDownload(res, body.filename || "resume.doc", htmlDoc, "application/msword");
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
  console.log(`Advanced Resume Coach running on http://localhost:${port}`);
});
