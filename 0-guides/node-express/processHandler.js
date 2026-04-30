const processHandlers = () => {
  process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:", err);
    process.exit(1); //1 = sistem bozuldu, hata var
  });

  process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION:", err);
    process.exit(1); //1 = sistem bozuldu, hata var
  });

  // SIGINT: Kullanıcı terminalde CTRL + C yaptığında tetiklenir.
  // Genellikle uygulamanın manuel olarak durdurulması anlamına gelir.
  // Burada graceful shutdown (temiz kapanış) işlemleri yapılır.

  process.on("SIGINT", async () => {
    console.log("CTRL+C detected. Shutting down...");
    process.exit(0); //0 = bilinçli ve temiz çıkış
  });

  // SIGTERM: Sistem, container (Docker/Kubernetes), PM2 gibi araçlar
  // tarafından uygulamayı durdurmak için gönderilen sinyaldir.
  // Production ortamında uygulamanın kontrollü şekilde kapanmasını sağlar.
  // Burada DB/Redis bağlantıları kapatılmalı, işlemler tamamlanmalıdır.

  process.on("SIGTERM", async () => {
    console.log("SIGTERM received. Graceful shutdown...");
    process.exit(0);//0 = bilinçli ve temiz çıkış
  });
};


export default processHandlers
