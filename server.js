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

app.use((req,res,next)=>{
  res.on("finish", ()=> httpRequestCounter.labels(req.path, req.method, res.statusCode).inc());
  next();
});

app.get("/", (_, res) => res.send("Hello from DevOps Pipeline Demo!"));
app.get("/api/ping", (_, res) => res.json({ ok: true, pong: Date.now() }));
app.get("/health", (_, res) => res.json({ status: "ok" }));
app.get("/metrics", async (_, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App running on :${port}`));