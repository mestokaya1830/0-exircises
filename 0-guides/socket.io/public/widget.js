import initForm from "./chat.form.js";
initForm();

//form varibales
const chatBox = document.getElementById("chatBox");
const chatTrigger = document.getElementById("chatTrigger");
const minimizeBtn = document.getElementById("minimizeBtn");
const iconChat = document.getElementById("iconChat");
const iconClose = document.getElementById("iconClose");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");


//document variable
const { apikey, tenantid } = document.getElementById("data")?.dataset || {};
const domain = window.location.origin;
const visitorId = localStorage.getItem("visitorId");


//form actions
function toggleChat() {
  const isShown = chatBox.classList.toggle("show");
  chatTrigger.classList.toggle("active", isShown);

  if (isShown) chatInput.focus();
}

chatTrigger.addEventListener("click", toggleChat);
minimizeBtn.addEventListener("click", toggleChat);

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const messageText = chatInput.value.trim();

  if (messageText) {
    const userMsg = document.createElement("div");
    userMsg.className = "message sent";
    userMsg.textContent = messageText;
    chatMessages.appendChild(userMsg);

    chatInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});

const login = async () => {
  try {
    const fetchUser = await fetch("http://localhost:4001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: apikey,
        tenantId: tenantid,
        domain
      }),
    });
    const res = await fetchUser.json()
    if(!res.success){
      console.error('Server Error')
    }
    initSocket(res.token)
  } catch (error) {
    console.error(error)
  }
};

login()


//socket
let socket = null
const initSocket = async (token) => {
  const socket = io("http://localhost:4001", {
    transports: ["websocket"],
    auth: {
      token,
    },
  });
  
  socket.on("connect", () => {
    console.log("User connected:", socket.id);
  });
}

