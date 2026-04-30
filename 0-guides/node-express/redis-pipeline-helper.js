import redis from '../config/connectRedis.js';

async function bulkSet(entries, ttlSeconds = 3600) {
  const pipeline = redis.pipeline();

  for (const [key, value] of Object.entries(entries)) {
    // Veri objeyse stringify yapmalıyız, yoksa Redis hata verir
    const finalValue = typeof value === 'object' ? JSON.stringify(value) : value;
    pipeline.set(key, finalValue, 'EX', ttlSeconds);
  }

  const results = await pipeline.exec();

  // Hata kontrolü
  results?.forEach(([err], i) => {
    if (err) console.error(`[Redis] Pipeline error at index ${i}:`, err);
  });

  return results; // Sonuçları controller'da görmek isteyebiliriz
}

export default bulkSet; // Fonksiyon ismiyle aynı olmalı



//in router
👉// Pipeline set fonksiyonumuzu çağırıyoruz
    await bulkSet(productsData, 3600); // 1 saat TTL ile
    
    
👉 // Pipeline get ile toplu çekme yapıyoruz
    const products = await bulkGet(ids);
