import { criticalQueue, normalQueue, bulkQueue } from "../utils/queue.js";

// 🔐 Reset Password
export const sendResetEmail = async (email) => {
  await criticalQueue.add("reset-password", {
    to: email,
    subject: "Reset Password",
    body: "Reset link...",
  });
};

// ⚡ Önemli email
export const sendImportantEmail = async ({ to, subject, body }) => {
  await criticalQueue.add("important-email", { to, subject, body });
};

// 📩 Normal email
export const sendEmail = async ({ to, subject, body }) => {
  await normalQueue.add("normal-email", { to, subject, body });
};

// 📢 Bulk email
export const sendBulkEmail = async (users, subject, body) => {
  const jobs = users.map((user) => ({
    name: "bulk-email",
    data: { to: user.email, subject, body }
  }));

  await bulkQueue.addBulk(jobs); // ✅ Promise.all yerine addBulk kullan
};


// ❌ Senin eski yöntemin → her biri ayrı Redis connection açar
await Promise.all(users.map((user) => queue.add(...)))

// ✅ Doğrusu → tek seferde toplu ekler, çok daha performanslı
await bulkQueue.addBulk(jobs)
