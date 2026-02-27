import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import apiRouter from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', apiRouter);

// ─── Error Handling ───────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(env.PORT, () => {
  console.log(`[server] VibeHotel API running on http://localhost:${env.PORT}`);
  console.log(`[server] Environment: ${env.NODE_ENV}`);
});

export default app;
