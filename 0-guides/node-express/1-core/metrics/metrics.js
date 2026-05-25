const express = require('express');
const client = require('prom-client');
const app = express();
client.collectDefaultMetrics();

// =========================
// METRICS ENDPOINT
// =========================
    app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// =========================
// HTTP METRICS
// =========================

export const httpRequestDuration = new client.Histogram({
  name: 'my_http_requests_duration_seconds',
  help: 'HTTP request latency',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5]
})

export const httpRequestsTotal = new client.Counter({
  name: 'my_http_requests_total',
  help: 'HTTP requests total',
  labelNames: ['method', 'route', 'status']
})

export const httpErrorsTotal = new client.Counter({
  name: 'myapp_http_errors_total',
  help: 'HTTP errors total',
  labelNames: ['method', 'route', 'status'],
});

// =========================
// BUSINESS METRICS
// =========================

export const loginCounter = new client.Counter({
  name: 'myapp_login_total',
  help: 'Login attempts',
  labelNames: ['status'],
});

export onst signupCounter = new client.Counter({
  name: 'myapp_signup_total',
  help: 'Signup count',
});

export onst paymentCounter = new client.Counter({
  name: 'myapp_payments_total',
  help: 'Payment events',
  labelNames: ['status', 'provider'],
});

export const cacheCounter = new client.Counter({
  name: 'myapp_cache_operations_total',
  help: 'Cache hit/miss operations',
  labelNames: ['type'],
});

export const businessEvents = new client.Counter({
  name: 'myapp_business_events_total',
  help: 'Business events tracking',
  labelNames: ['event_type'],
});

// =========================
// INFRA METRICS
// =========================

export const queueSizeGauge = new client.Gauge({
  name: 'myapp_queue_size',
  help: 'Queue size per queue',
  labelNames: ['queue_name'],
});

export const websocketConnections = new client.Gauge({
  name: 'myapp_websocket_connections',
  help: 'Active websocket connections',
});

export const dbQueryDuration = new client.Histogram({
  name: 'myapp_db_query_duration_seconds',
  help: 'Database query latency',
  labelNames: ['query_type'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
});

export const externalApiLatency = new client.Histogram({
  name: 'myapp_external_api_duration_seconds',
  help: 'External API latency',
  labelNames: ['service'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});

// =========================
// AUTH ROUTES
// =========================

// loginCounter  → başarılı/başarısız login ayrımı için { status: 'success' | 'failure' }
// businessEvents→ genel event akışında login'i de izlemek için { event_type: 'login' }
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await authenticateUser(username, password);

    if (!user) {
      loginCounter.inc({ status: 'failure' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    loginCounter.inc({ status: 'success' });
    businessEvents.inc({ event_type: 'login' });

    res.json({ token: generateToken(user) });
  } catch (err) {
    loginCounter.inc({ status: 'failure' });
    res.status(500).json({ error: 'Login failed' });
  }
});

// signupCounter  → kaç yeni kullanıcı oluşturuldu
// businessEvents → genel event akışında signup'ı da izlemek için { event_type: 'signup' }
app.post('/auth/signup', async (req, res) => {
  try {
    const user = await createUser(req.body);

    signupCounter.inc();
    businessEvents.inc({ event_type: 'signup' });

    res.status(201).json({ id: user.id });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' });
  }
});


// =========================
// PAYMENT ROUTES
// =========================

// paymentCounter → ödeme sonucu ve hangi provider'dan geldiğini izler
//                  { status: 'success' | 'failure', provider: 'stripe' | 'paypal' }
// businessEvents → genel event akışında ödemeyi de izler { event_type: 'payment' }
app.post('/payments/charge', async (req, res) => {
  const { provider, amount } = req.body;

  try {
    await chargePayment(provider, amount);

    paymentCounter.inc({ status: 'success', provider });
    businessEvents.inc({ event_type: 'payment' });

    res.json({ success: true });
  } catch (err) {
    paymentCounter.inc({ status: 'failure', provider });
    res.status(500).json({ error: 'Payment failed' });
  }
});


// =========================
// PRODUCT ROUTES
// =========================

// cacheCounter   → önce cache'e bak, varsa 'hit', yoksa 'miss' say
// dbQueryDuration→ cache miss durumunda DB'ye gidilen sorgunun süresini ölç { query_type: 'select' }
app.get('/products/:id', async (req, res) => {
  const cacheKey = `product:${req.params.id}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    cacheCounter.inc({ type: 'hit' });
    return res.json(JSON.parse(cached));
  }

  cacheCounter.inc({ type: 'miss' });

  const dbStart = Date.now();
  const product = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
  dbQueryDuration.observe({ query_type: 'select' }, (Date.now() - dbStart) / 1000);

  await redis.set(cacheKey, JSON.stringify(product), 'EX', 300);
  res.json(product);
});

// dbQueryDuration→ insert sorgusunun süresini ölç { query_type: 'insert' }
// businessEvents → yeni ürün oluşturma eventini genel akışta izle { event_type: 'product_created' }
app.post('/products', async (req, res) => {
  const dbStart = Date.now();
  const product = await db.query(
    'INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *',
    [req.body.name, req.body.price]
  );
  dbQueryDuration.observe({ query_type: 'insert' }, (Date.now() - dbStart) / 1000);

  businessEvents.inc({ event_type: 'product_created' });
  res.status(201).json(product);
});


// =========================
// ORDER ROUTES
// =========================

// externalApiLatency → dış servise yapılan çağrının süresini ölç { service: 'inventory' }
// dbQueryDuration    → sipariş insert sorgusunun süresini ölç { query_type: 'insert' }
// businessEvents     → sipariş oluşturma eventini izle { event_type: 'order_created' }
// queueSizeGauge     → sipariş queue'ya eklendikten sonra güncel boyutu set et { queue_name: 'orders' }
app.post('/orders', async (req, res) => {
  // Dış inventory servisini kontrol et
  const apiStart = Date.now();
  await inventoryService.check(req.body.productId);
  externalApiLatency.observe({ service: 'inventory' }, (Date.now() - apiStart) / 1000);

  // Siparişi DB'ye yaz
  const dbStart = Date.now();
  const order = await db.query(
    'INSERT INTO orders (product_id, quantity) VALUES ($1, $2) RETURNING *',
    [req.body.productId, req.body.quantity]
  );
  dbQueryDuration.observe({ query_type: 'insert' }, (Date.now() - dbStart) / 1000);

  businessEvents.inc({ event_type: 'order_created' });

  // Queue'ya ekle ve güncel boyutu güncelle
  await orderQueue.add(order);
  const queueSize = await orderQueue.count();
  queueSizeGauge.set({ queue_name: 'orders' }, queueSize);

  res.status(201).json(order);
});


// =========================
// WEBSOCKET
// =========================

// websocketConnections → bağlantı kurulunca +1, kopunca -1
io.on('connection', (socket) => {
  websocketConnections.inc();

  socket.on('disconnect', () => {
    websocketConnections.dec();
  });
});


app.listen(3000);


👉 BUCKET
Diyelim ki bir gün boyunca 5 istek geldi ve süreleri şunlar:
0.2s, 0.4s, 0.8s, 1.5s, 3s
buckets: [0.1, 0.3, 0.5, 1, 2, 5] ile Prometheus şunu sorar:

"0.1 saniyeden hızlı kaç istek var?" → 0 tane
"0.3 saniyeden hızlı kaç istek var?" → 1 tane (0.2s)
"0.5 saniyeden hızlı kaç istek var?" → 2 tane (0.2s, 0.4s)
"1 saniyeden hızlı kaç istek var?" → 3 tane (0.2s, 0.4s, 0.8s)
"2 saniyeden hızlı kaç istek var?" → 4 tane (0.2s, 0.4s, 0.8s, 1.5s)
"5 saniyeden hızlı kaç istek var?" → 5 tane (hepsi)


Bunu neden yapıyoruz? Grafana'da şunu sorabilmek için:

"İsteklerin %95'i kaç saniyede tamamlanıyor?"

Buna p95 latency denir ve production'da en önemli metriklerden biridir.

