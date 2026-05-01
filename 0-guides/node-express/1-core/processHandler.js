import logger from "./logger/logger.js";

const processHandlers = (server) => {
  const shutDown = async (signal, err = null) => {
    if(err){
      logger.error(`${signal} - App shutting down to error`, err)
      process.env.NODE_ENV == 'development' ? console.error(`${signal}`, err) : ""
    } else {
      logger.info(`${signal} - App shutting down gracefully`)
    }

    if(server) server.close(() => logger.info('HTTP server closed!'))

    setTimeout(() => process.exit(err ? 1 : 0), 500)
  }

  server.on('error', (err) => shutDown('Server Error: ', err));
  ["SIGINT", "SIGTERM", "uncaughtException", "unhandledRejection"].forEach(item => process.on(item, () => shutDown(item)))
}

export default processHandlers




Kısaca anlamları şöyledir:

1. SIGINT (Signal Interrupt)
Nedir: Genellikle terminalde Ctrl + C tuşlarına bastığınızda gönderilen sinyaldir.

Kullanım Amacı: Kullanıcı uygulamayı manuel olarak durdurmak istediğinde tetiklenir. Kodunuz bunu yakalar ve "Aniden fişi çekmek yerine, önce açık işlerimi bitirip öyle kapanayım" (Graceful Shutdown) der.

2. SIGTERM (Signal Termination)
Nedir: İşletim sistemi veya bir servis yöneticisi (Docker, Kubernetes, PM2 gibi) tarafından gönderilen "Artık kapanma vaktin geldi" sinyalidir.

Kullanım Amacı: Bu sistemler uygulamaya kapanması için bir süre tanır. Eğer uygulama bu sinyali alıp kendini kapatmazsa, sistem bir süre sonra uygulamayı zorla öldürür (SIGKILL).

Neden Kullanıyoruz?
Eğer bu satırları yazmazsanız, uygulama kapatma komutu geldiği an pat diye kesilir. Bu da şu sorunlara yol açabilir:

Yarıda kalan HTTP istekleri hata verir.

Dosya yazılıyorsa dosya bozulabilir.

Bellekte temizlenmesi gereken veriler öylece kalır.

Özetle: Bu kodlar sayesinde uygulama "Kapatılıyorum!" bilgisini alır, shutDown fonksiyonunu çalıştırır ve her şeyi düzgünce (gracefully) sonlandırır.


-----------------------------------------------------------------


Evet, aynen öyle! Bu iki satır uygulamanın beklenmedik şekilde çökmesini engellemek yerine, çökme anında kontrollü bir veda yapmasını sağlar.

Normalde Node.js'de bu hatalar olduğunda uygulama aniden durur, ancak bu satırlar sayesinde "durmadan hemen önce" son bir işlem yapma (loglama, sunucuyu kapatma vb.) şansımız olur.

Aralarındaki farklar şunlardır:

1. uncaughtException (Yakalanmamış İstisna)
Bu, kodun herhangi bir yerinde try...catch bloğuna alınmamış, standart bir hatadır.

Örnek: Var olmayan bir değişkeni kullanmaya çalışmak.

Durum: Kod o satıra geldiği an patlar. Eğer bu dinleyici (listener) yoksa Node.js hatayı konsola basar ve süreci anında bitirir.

2. unhandledRejection (Yönetilmemiş Reddetme)
Bu, Promise yapılarındaki hatalar için geçerlidir. Bir asenkron işlem başarısız olduğunda (reject olduğunda) sonuna .catch() eklememişseniz veya await kısmını try...catch içine almamışsanız bu olay tetiklenir.

Örnek: Veritabanına bağlanmaya çalışırken internetin kopması ve bu hatayı yakalayan bir mekanizmanın olmaması.

Bu Hatalar Neden Tehlikelidir?
Bu hatalar gerçekleştiğinde uygulamanın durumu "belirsiz" (unclean state) hale gelir. Örneğin:

Bellekte (RAM) veriler bozulmuş olabilir.

Bir işlem yarıda kalmış ve veritabanı bağlantısını kitlemiş olabilir.

İşleyiş Mantığı:
Kodundaki shutDown fonksiyonunun içinde process.exit(1) (1 hata kodudur) kullanılmasının sebebi de budur. Bu hatalar oluştuğunda en güvenli yol; hatayı loglamak, mevcut işleri durdurmak ve uygulamayı kapatıp (varsa PM2 veya Docker gibi sistemler aracılığıyla) temiz bir şekilde yeniden başlatmaktır.

Özetle; bu satırlar uygulamanın "sessizce ölmesini" engeller, hatanın nedenini günlüğe (log) kaydeder ve sistemi güvenli bir duruma çeker.
