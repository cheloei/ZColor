const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(process.cwd(), "dist");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendFile(res, filePath, isHTML = false) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("404 Not Found");
    }

    if (isHTML) {
      data = data.replace(
        "<head>",
        `<head>
<script>window.__ZCOLOR_DEV_SERVER__ = true;</script>`,
      );
    }

    const ext = path.extname(filePath).toLowerCase();

    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "text/html; charset=utf-8",
    });

    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);

    // root
    if (urlPath === "/") {
      res.writeHead(302, {
        Location: "/html/index.html",
      });
      return res.end();
    }

    // routes → /html/*.html
    else if (!path.extname(urlPath)) {
      urlPath = `/html${urlPath}.html`;
    }

    const filePath = path.join(DIST_DIR, urlPath);

    // security
    if (!filePath.startsWith(DIST_DIR)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    const isHTML = filePath.endsWith(".html");

    sendFile(res, filePath, isHTML);
  } catch (e) {
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`🚀 ZColor Dev Server running`);
  console.log(`🌐 http://localhost:${PORT}`);
});
