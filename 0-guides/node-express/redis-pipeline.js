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
