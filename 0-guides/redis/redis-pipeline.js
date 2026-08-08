👉//set pipeline--------------------
router.post('/bulk-update', async (req, res) => {
  try {
    const { products } = req.body; // Dışarıdan bir ürün listesi geldiğini düşün

    // 1. Her istek geldiğinde YENİ bir pipeline oluşturuyoruz
    const pipeline = redis.pipeline();

    products.forEach(p => {
      // Komutları bu isteğe özel sepete diziyoruz
      pipeline.set(`product:${p.id}`, JSON.stringify(p), 'EX', 3600);
    });

    // 2. Redis'e "Hepsini şimdi yap" emrini veriyoruz
    const results = await pipeline.exec();

    // 3. İşlem bitti, sepet (pipeline) görevini tamamladı
    res.status(200).json({ message: "Başarıyla güncellendi", details: results });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

👉//get pipeline--------------------
router.get('/bulk-get-products', async (req, res) => {
  try {
    // 1. Çekmek istediğimiz ID'ler (Query'den veya body'den gelebilir)
    const productIds = ['101', '102', '103']; 

    // 2. Sepeti (Pipeline) oluştur
    const pipeline = redis.pipeline();

    // 3. Her ID için bir GET komutu ekle
    productIds.forEach(id => {
      pipeline.get(`product:${id}`);
    });

    // 4. Redis'e toplu isteği gönder
    const results = await pipeline.exec();

    /* results formatı şöyledir:
       [ [null, '{"name":"Elma"}'], [null, '{"name":"Armut"}'], [null, null] ]
       (İlk eleman hata, ikinci eleman veridir)
    */

    // 5. Veriyi temizle ve anlamlı hale getir
    const products = results.map(([err, val]) => {
      if (err) return null; // Bir hata varsa null dön
      return val ? JSON.parse(val) : null; // Veri varsa JSON'a çevir, yoksa null
    });

    res.status(200).json(products);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




Harika bir soru! Aslında bulkSet (Pipeline) ihtiyacı, verinin boyutundan ziyade, verinin parçalı olup olmamasıyla ilgilidir.

Şu üç senaryo gerçekleştiğinde bulkSet senin hayatını kurtarır:

1. "Granüler" (Parçalı) Güncelleme Gerektiğinde
Diyelim ki bir e-ticaret siten var ve ana sayfada 50 farklı ürünün stok adedini cache'lemek istiyorsun.

Yanlış Yol: Tüm ürünleri tek bir products key'ine dev bir JSON olarak atmak. (Çünkü 1 ürünün stoğu değişirse, 50 ürünlük koca paketi tekrar yazman gerekir).

Doğru Yol (bulkSet): Her ürünü kendi key'iyle (product:1, product:2) saklamak. Stok değişince sadece o key'i güncellersin. İşte bu 50 key'i aynı anda ilk kez cache'e atarken bulkSet kullanırsın.

2. Yüksek Trafikli "User Status" Sistemlerinde
Uygulamanda 100 kullanıcının anlık olarak "online/offline" olduğunu veya "son görülme" zamanını güncellemen gerektiğini düşün.

Eğer döngü içinde 100 kez await redis.set(...) dersen, uygulaman Redis'e 100 kere gidip gelir. Bu da ciddi bir gecikme (latency) yaratır.

bulkSet ile bu 100 güncellemeyi tek bir paket yapıp gönderirsin.

3. Farklı Key'lere TTL (Süre) Ataman Gerektiğinde
Eğer her verinin silinme süresi farklıysa tek bir büyük JSON kullanamazsın.

Örneğin; "Popüler Haberler" 10 dakika, "Hava Durumu" 30 dakika cache'te kalmalı.

Bu verileri ayrı anahtarlarda tutup, bulk bir şekilde Redis'e fırlatabilirsin.



async function bulkSetProducts(products) {
  // 1. ioredis üzerinden bir pipeline (sepet) oluştur
  const pipeline = redis.pipeline();

  // 2. Her bir ürünü sepete ekle (Henüz Redis'e gitmedi)
  products.forEach(product => {
    const key = `product:stock:${product.id}`;
    const value = product.stockCount;
    pipeline.set(key, value, 'EX', 3600); // Her birine 1 saat TTL
  });

  // 3. Sepeti tek seferde Redis'e fırlat
  const results = await pipeline.exec();
  
  // results formatı: [[null, "OK"], [null, "OK"], ...]
  console.log("Tüm stoklar güncellendi!");
}




async function bulkGetProducts(productIds) {
  const pipeline = redis.pipeline();

  // 1. Çekmek istediğin her key için bir GET komutu diz
  productIds.forEach(id => {
    pipeline.get(`product:stock:${id}`);
  });

  // 2. Redis'e tek seferde git ve sonuçları al
  const results = await pipeline.exec();

  // 3. ioredis sonuçları [hata, değer] çiftleri halinde döner. 
  // Sadece değerleri temiz bir diziye çekelim:
  const stocks = results.map(([err, value]) => value);

  return stocks; 
  // Sonuç: [10, 250, 0, 45, ...] (Sıralama productIds ile aynıdır)
}

