import express from "express";
import client from "prom-client";

const app = express();
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["route","method","status"]
});
register.registerMetric(httpRequestCounter);

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Request duration in seconds",
  labelNames: ["route", "method", "status"],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
});
register.registerMetric(httpRequestDuration);

const buildInfo = new client.Gauge({
  name: "app_build_info",
  help: "Build metadata as labels",
  labelNames: ["version", "git_sha"],
});
buildInfo.set(
  { version: process.env.APP_VERSION || "dev", git_sha: process.env.GIT_SHA || "dev" },
  1
);

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    httpRequestCounter.labels(req.path, req.method, res.statusCode).inc();
    end({ route: req.path, method: req.method, status: res.statusCode });
  });
  next();
});

app.get("/", (_, res) => res.send("Hello from DevOps Pipeline Demo!"));
app.get("/api/ping", (_, res) => res.json({ ok: true, pong: Date.now() }));
app.get("/health", (_, res) => res.json({ status: "ok" }));
app.get("/version", (_, res) =>
  res.json({ version: process.env.APP_VERSION || "dev", git_sha: process.env.GIT_SHA || "dev" })
);
app.get("/metrics", async (_, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App running on :${port}`));