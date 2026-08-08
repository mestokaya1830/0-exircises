// connectMongo.js
import mongoose from "mongoose";
import logger from "./logger.js";

// ✅ Bu dosyadan çıkan tüm loglar otomatik service: "database" taşır
const dbLogger = logger.child({ service: "database" });

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    dbLogger.info("MongoDB bağlantısı başarılı", {
      host: mongoose.connection.host,
      db: mongoose.connection.name,
    });
  } catch (err) {
    dbLogger.error("MongoDB bağlantısı başarısız", { err });
    process.exit(1);
  }
};

export default connectMongo;
