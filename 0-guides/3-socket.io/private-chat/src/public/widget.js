const apiKey = document.currentScript.dataset.apikey;
const companyId = "mesfor";
//html
const userForm = document.getElementById("userForm");
const userList = document.getElementById("userList");
const msgForm = document.getElementById("msgForm");
const msgList = document.getElementById("msgList");
let dialog = document.getElementById("dialog");
let title = document.getElementById("title");
let userTitle = document.getElementById("userTitle");

//variables
let username = "";
let receiver = "";
let socket = null;

const appendUser = (username) => {
  const li = document.createElement("li");
  li.textContent = username;
  li.addEventListener("click", (e) => {
    dialog.open = true;
    receiver = username;
    title.innerText = username;
    msgList.textContent = "";
  });
  userList.appendChild(li);
};

//get token
const login = async () => {
  const result = await fetch("http://localhost:4001/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey,
      companyId,
    }),
  });
  const data = await result.json();
  console.log(data);
  if (!data || !data.success) {
    return
  }
  initSocket(data.token)
};
login();


//set socket
const initSocket = (token) => {
  socket = io("http://localhost:4001", {
    transports: ["websocket"],
    auth: { token },
  });

  socket.on("message", (data) => {
    console.log(data);
  });
  socket.on("error", (data) => {
    console.log(data);
  });
};


//add user
userForm.addEventListener("submit", (e) => {
  e.preventDefault();
  username = document.getElementById("userInput").value.trim();
  if (!username) {
    alert("Please enter a valid Username...");
  }
  socket.emit("new-user", username);
  socket.on("user-exists", (username) => {
    console.log(username + " is exists");
  });

  socket.on("user-connected", (username) => {
    appendUser(username);
  });
  socket.on("all-users", (users) => {
    userList.innerHTML = "";
    userForm.style.display = "none";
    userTitle.innerText = username;
    users.forEach((user) => {
      if (user !== username) {
        appendUser(user);
      }
    });
  });
});


//messages
msgForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.getElementById("msgInput").value.trim();
  if (!message) {
    alert("Please enter message..");
    return;
  }
  socket.emit("message", {
    receiver,
    role: "visitor",
    message,
  });
});
