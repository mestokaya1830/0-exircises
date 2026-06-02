import express from 'express';
import pool from './db.js';

const app = express();

app.get('/health', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();

    res.json({
      status: 'ok',
      db: 'connected',
      time: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      db: 'disconnected',
      error: err.message,
    });
  }
});

export default app;
