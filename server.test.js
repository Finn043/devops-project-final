import request from 'supertest';
import app from './server.js';

describe('API Endpoints', () => {

  it('GET / - should return the e-commerce home page', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('TechStore');
  });

  it('GET /health - should return status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/ping - should return pong and timestamp', async () => {
    const res = await request(app).get('/api/ping');
    expect(res.statusCode).toEqual(200);
    expect(res.body.ok).toBe(true);
    expect(res.body).toHaveProperty('pong');
  });

  it('GET /metrics - should return Prometheus metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('process_cpu_user_seconds_total');
  });
});
