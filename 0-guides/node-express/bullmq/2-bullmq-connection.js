import { Queue } from 'bullmq' // BullMQ kütüphanesinden 'Queue' (Kuyruk) sınıfını içeri aktarır.
import connectIORedis from './connectIORedis.js' // Redis bağlantı ayarlarını içeren dosyayı dahil eder.

// 'email-queue' adında yeni bir iş kuyruğu oluşturur.
const emailQueue = new Queue('email-queue', {
  
  // connection: Kuyruğun verileri depolamak ve yönetmek için kullanacağı Redis bağlantısı.
  connection: connectIORedis,

  // defaultJobOptions: Bu kuyruğa eklenen her iş (job) için varsayılan olarak geçerli olacak ayarlar.
  defaultJobOptions: {
    
    // attempts: Bir iş hata verirse toplam kaç kez deneneceğini belirler (Burada 5 deneme).
    attempts: 5,

    // backoff: Başarısız olan işlerin tekrar denenmesi arasındaki bekleme süresi stratejisi.
    backoff: {
      type: 'exponential', // 'exponential' (üstel): Her hatada bekleme süresi katlanarak artar.
      delay: 3000          // Başlangıç bekleme süresi (3 saniye).
    },

    // removeOnComplete: İş başarıyla bittiğinde Redis'te tutulacak geçmiş kayıt sayısı.
    // En son tamamlanan 100 işi tutar, eskileri siler (Bellek yönetimi için önemlidir).
    removeOnComplete: 100,

    // removeOnFail: İş kalıcı olarak başarısız olduğunda (tüm denemeler bittiğinde) tutulacak kayıt sayısı.
    // Hataları incelemek için son 200 başarısız işi saklar.
    removeOnFail: 200
  },

  // limiter: Hız sınırlayıcı. Kuyruğun belirli bir zaman diliminde işleyebileceği maksimum iş sayısı.
  limiter: {
    max: 10,      // Belirtilen süre içinde maksimum 10 işe izin verilir.
    duration: 1000 // Milisaniye cinsinden süre (1000ms = 1 saniye).
  }
})

export default emailQueue // Oluşturulan bu kuyruk yapısını diğer dosyalarda kullanabilmek için dışa aktarır.
