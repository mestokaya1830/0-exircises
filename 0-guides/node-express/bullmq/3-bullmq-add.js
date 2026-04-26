import emailQueue from "../utils/queue.js";

// 🔐 Reset Password
export const sendResetEmail = async (email) => {
  console.log('JOB ADDED: reset')

  await emailQueue.add("send-email", {
    to: email,
    subject: "Reset Password",
    body: "Reset link...",
  }, {
    priority: 1
  });
};

// ⚡ Önemli email
export const sendImportantEmail = async ({ to, subject, body }) => {
  console.log('JOB ADDED: important')

  await emailQueue.add("send-email", {
    to,
    subject,
    body,
  }, {
    priority: 2
  });
};

// 📩 Normal email
export const sendEmail = async ({ to, subject, body }) => {
  console.log('JOB ADDED: normal')

  await emailQueue.add("send-email", {
    to,
    subject,
    body,
  }, {
    priority: 5
  });
};

// 📢 Bulk email
export const sendBulkEmail = async (users, subject, body) => {
  console.log('JOB ADDED: bulk')

  await Promise.all(
    users.map((user) =>
      emailQueue.add("send-email", {
        to: user.email,
        subject,
        body,
      }, {
        priority: 10
      })
    )
  );
};
