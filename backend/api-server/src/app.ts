import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// In production, serve the built frontend from the same process so the whole
// site is one deployable service. In dev, the Vite dev server (with a proxy
// for /api) serves the frontend instead.
if (process.env["NODE_ENV"] === "production") {
  const distDir = path.resolve(process.cwd(), "../../frontend/dist");
  app.use(express.static(distDir));
  app.get("/*splat", (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

export default app;
