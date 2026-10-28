import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'http';
import jwt from 'jsonwebtoken';
import app from '../../../app';
import config from '../../../config';

describe('HTTP request limits', () => {
  let server: Server;
  let base: string;
  beforeAll(async () => {
    server = app.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => server.once('listening', resolve));
    base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/v1`;
  });
  afterAll(() => new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())));

  it('shares the auth limit across login and register and returns Retry-After', async () => {
    for (let i = 0; i < 20; i++) {
      const res = await fetch(`${base}/auth/${i % 2 ? 'register' : 'login'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      });
      expect(res.status).toBe(400);
    }
    const blocked = await fetch(`${base}/auth/login`, { method: 'POST' });
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
    expect((await blocked.json()).success).toBe(false);
  });

  it('limits AI generation per authenticated account', async () => {
    const token = (id: string) => jwt.sign({ id, role: 'ESTIMATOR' }, config.jwt.secret);
    const request = (id: string) => fetch(`${base}/projects/generate`, {
      method: 'POST', headers: { Authorization: `Bearer ${token(id)}`, 'Content-Type': 'application/json' }, body: '{}',
    });
    for (let i = 0; i < 10; i++) expect((await request('account-one')).status).toBe(400);
    expect((await request('account-one')).status).toBe(429);
    expect((await request('account-two')).status).toBe(400);
    expect((await fetch(`${base}/projects/generate`, { method: 'POST' })).status).toBe(401);
  });
});
