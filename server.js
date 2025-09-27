import express from 'express';
import client from 'prom-client';
const app = express();
const port = 3000;

const register = new client.Registry();
client.collectDefaultMetrics({ register });

// --- NEW METRICS ---
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Request duration in seconds',
  labelNames: ['route', 'method', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
});
register.registerMetric(httpRequestDuration);

const buildInfo = new client.Gauge({
  name: 'app_build_info',
  help: 'Build metadata as labels',
  labelNames: ['version', 'git_sha']
});
register.registerMetric(buildInfo);
// -------------------

// --- MIDDLEWARE TO TRACK METRICS ---
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  buildInfo.set({ 
    version: process.env.APP_VERSION || 'dev', 
    git_sha: process.env.GIT_SHA || 'dev' 
  }, 1);

  res.on('finish', () => {
    end({ route: req.path, method: req.method, status: res.statusCode });
  });
  next();
});
// ------------------------------------

app.get('/', (req, res) => {
  const coverPageHtml = `
    <body style="font-family: Arial, sans-serif; background-color: #f0f2f5; color: #333; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; text-align: center;">
      <div style="background-color: white; padding: 40px 60px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h1 style="color: #0056b3; font-size: 2.5em; margin-bottom: 10px;">SWE40006 - Software Deployment and Evolution</h1>
        <h2 style="color: #555; font-size: 1.8em; margin-top: 0; margin-bottom: 30px;">Group Project</h2>
        <p style="font-size: 1.2em; margin: 10px 0;"><strong>Group Name:</strong> Group 1</p>
        <p style="font-size: 1.2em; margin: 10px 0;"><strong>Class:</strong> Wednesday 16:30</p>
      </div>
    </body>
  `;
  res.send(coverPageHtml);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/ping', (req, res) => {
  res.json({ ok: true, pong: Date.now() });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(port, () => {
  console.log(`Server starting on http://localhost:${port}`);
});