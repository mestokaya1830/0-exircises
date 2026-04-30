import Redis from 'ioredis';

const nodes = [
  { host: process.env.REDIS_NODE_1 || '127.0.0.1', port: parseInt(process.env.REDIS_PORT_1) || 6379 },
  process.env.REDIS_NODE_2 ? { host: process.env.REDIS_NODE_2, port: 6379 } : null,
  process.env.REDIS_NODE_3 ? { host: process.env.REDIS_NODE_3, port: 6379 } : null,
].filter(Boolean);

const cluster = new Redis.Cluster(nodes, {
  clusterRetryStrategy: (times) => Math.min(times * 100, 3000),
  enableReadyCheck: true, 
  scaleReads: 'slave',    
  
  // --- CLUSTER İÇİN EK KRİTİK AYARLAR ---
  dnsLookup: (address, callback) => callback(null, address), // Bazı ortamlarda DNS çözümleme hatalarını önler
  enableOfflineQueue: true, // Bağlantı kopukken gelen komutları sıraya alır
  // ---------------------------------------

  redisOptions: {
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null, 
    connectTimeout: 10000,
    keepAlive: 10000, // <--- Bunu mutlaka ekle! (Bağlantının "idling" olup düşmesini engeller)
  },
});

// Event Listenerlar (Zaten harika yapmışsın)
cluster.on('connect', () => console.log('🚀 Redis Cluster: Fiziksel bağlantı deneniyor...'));
cluster.on('ready', () => console.log('✅ Redis Cluster: Slot map yüklendi, hazır!'));
cluster.on('error', (err) => console.error('❌ Redis Cluster Hatası:', err));
cluster.on('node error', (err, node) => console.error(`⚠️ Node Hatası (${node.options.host}):`, err)); // Cluster'a özel!

export default cluster;
