const express = require('express');
const cors    = require('cors');
const redis   = require('redis');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Redis client (optional — won't crash if Redis isn't available)
let redisClient;
(async () => {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  try {
    redisClient = redis.createClient({ url });
    redisClient.on('error', (err) => console.warn('Redis error:', err.message));
    await redisClient.connect();
    console.log('Connected to Redis at', url);
  } catch (err) {
    console.warn('Redis unavailable — running without cache:', err.message);
  }
})();

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api', timestamp: new Date().toISOString() });
});

app.get('/api/products', async (req, res) => {
  const products = [
    { id: 1, name: 'Cloud T-Shirt',    price: 29.99, stock: 100 },
    { id: 2, name: 'K8s Coffee Mug',   price: 14.99, stock: 50  },
    { id: 3, name: 'Helm Chart Poster', price: 19.99, stock: 75  },
  ];
  if (redisClient?.isOpen) {
    await redisClient.set('last_fetch', new Date().toISOString());
  }
  res.json({ products, count: products.length });
});

app.post('/api/orders', async (req, res) => {
  const order = { id: Date.now(), ...req.body, status: 'processing', createdAt: new Date().toISOString() };
  if (redisClient?.isOpen) {
    await redisClient.lPush('orders', JSON.stringify(order));
  }
  res.status(201).json({ order, message: 'Order queued for processing' });
});

app.get('/api/orders', async (req, res) => {
  let orders = [];
  if (redisClient?.isOpen) {
    const raw = await redisClient.lRange('orders', 0, -1);
    orders = raw.map(o => JSON.parse(o));
  }
  res.json({ orders, count: orders.length });
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
