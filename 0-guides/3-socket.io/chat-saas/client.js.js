const login = async () => {
  const query = await fetch("http://127.0.0.1:4000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "mesto@test.com",
      password: "121212",
    }),
  });

  const result = await query.json();

  const socket = io("http://127.0.0.1:4000", {
    auth: {
      token: "Bearer " + result.token,
    },
  });

  const form = document.getElementById("message_form");
  const input = document.getElementById("message_input");
  const list = document.getElementById("message_list");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    socket.emit("client-msg", input.value);
    input.value = "";
  });
  socket.on("server-msg", (data) => {
    console.log(data);
    const li = document.createElement("li");
    li.textContent = data;
    list.appendChild(li);
  });

  socket.on("error-msg", (err) => {
    console.error("🚨 Sunucudan Gelen Kısıtlama Hatası:", err);
  });
  socket.on("connect", () => console.log("User connected"));
};

login();

