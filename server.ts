import express from "express";
import path from "path";
import { execSync } from "child_process";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON parsing
  app.use(express.json());

  // API Route: Build and export the single standalone HTML file
  app.get("/api/export", (req, res) => {
    try {
      console.log("Triggering single standalone HTML compilation via npm run build...");
      
      // Execute production build to produce the single-file inlined output
      execSync("npm run build", { stdio: "inherit" });

      const builtFilePath = path.join(process.cwd(), "dist", "index.html");

      if (fs.existsSync(builtFilePath)) {
        res.setHeader("Content-Type", "text/html");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="lease-calculator-portable.html"'
        );
        res.sendFile(builtFilePath);
      } else {
        res.status(550).json({
          error: "Build succeeded but output file was not found.",
          details: "dist/index.html was not generated.",
        });
      }
    } catch (error: any) {
      console.error("Error compiling standalone single-file:", error);
      res.status(500).json({
        error: "Failed to compile standalone single-file.",
        details: error.message,
      });
    }
  });

  // Serve static assets in production or use Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Development mode: Vite Dev Server middleware attached.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production mode: Serving static files from dist/ directory.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lease Calculator Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
