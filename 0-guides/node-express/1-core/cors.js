app.use(cors({
  origin: ['https://www.seninsiten.com', 'https://admin.seninsiten.com'];,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-custom-header'],
  credentials: true, // Cookie veya Authorization header gönderimi için kritik
  maxAge: 600 
));



// MaxAge = Tarayıcının 'preflight' (OPTIONS) isteğini önbelleğe alma süresi (saniye)
CORS mekanizması, güvenlik nedeniyle tarayıcıların "tehlikeli" olabilecek (DELETE, PUT, özel header içeren POST vb.) isteklerden önce sunucuya gönderdiği bir ön kontroldür. Bir senior geliştirici için bu sürecin nasıl optimize edileceğini anlamak, uygulamanın hem hızını hem de sunucu yükünü doğrudan etkiler.

1. Preflight (Ön Kontrol) Nedir?
Siz bir API isteği attığınızda, tarayıcı arka planda asıl istekten hemen önce bir OPTIONS isteği gönderir. Bu istek şunu sorar: "Hey sunucu, ben [https://app.com](https://app.com) adresinden geliyorum ve bir DELETE isteği atmak istiyorum. Buna iznin var mı?"

Sunucu "Evet" derse, asıl istek gönderilir. Yani tek bir işlem için iki kez ağ trafiği oluşur.

2. maxAge Parametresi Nedir?
maxAge (Access-Control-Max-Age), sunucunun tarayıcıya verdiği şu cevaptır:

"Bak, bu güvenlik onayını verdim ve bu onay X saniye boyunca geçerli. Bu süre zarfında aynı endpoint'e aynı tipte istek atarsan bana tekrar sormana (OPTIONS isteği atmana) gerek yok."

Kod örneği:

JavaScript
const corsOptions = {
  origin: 'https://www.seninsiten.com',
  maxAge: 86400 // 24 saat (saniye cinsinden)
};
3. Neden Kritik Bir Ayardır?
Performans (Latency): Her istekten önce bir de OPTIONS isteğinin gitmesi, API yanıt süresini teorik olarak iki katına çıkarır. Özellikle mobil ağlarda bu gecikme (latency) kullanıcı deneyimini çok bozar. maxAge ile bu gecikmeyi ortadan kaldırırsınız.

Sunucu Maliyeti: Eğer saniyede 1000 istek alan bir sisteminiz varsa ve maxAge kullanmıyorsanız, sunucunuz aslında saniyede 2000 istek karşılamak zorunda kalır. Boş yere CPU ve RAM tüketilir.

Log Kirliliği: Server loglarınızda binlerce anlamsız OPTIONS isteği görmek yerine, sadece gerçek verinin döndüğü GET, POST gibi istekleri görürsünüz.

4. Tarayıcı Limitleri (Önemli Detay)
Her ne kadar siz maxAge değerini çok yüksek tutsanız da, tarayıcıların kendi üst limitleri vardır:

Chromium (Chrome, Edge): Maksimum 2 saat (7200 saniye).

Firefox: Maksimum 24 saat (86400 saniye).

Safari: Maksimum yaklaşık 5 dakika.

Bu yüzden genelde maxAge: 600 (10 dakika) veya maxAge: 3600 (1 saat) gibi değerler ideal kabul edilir.

5. Nasıl Test Edilir?
Tarayıcınızın Network sekmesini açın:

İlk istekte bir OPTIONS (Preflight) ve bir de asıl isteği (örneğin POST) göreceksiniz.

Sayfayı yenileyip aynı isteği tekrar attığınızda, eğer maxAge düzgün çalışıyorsa, sadece asıl isteği göreceksiniz; OPTIONS isteği listeden kaybolacaktır (çünkü tarayıcı onu cache'den okur).
