const socket = io("", {
  auth: {
    // token: localStorage.getItem("token"),
    userId: '6a1a0592d5c4d453c522b887'
  },
});

socket.on("connect", () => {
  console.log("connected:", socket.id);
});

socket.on("server-msg", (data) => {
  console.log("server-msg:", data);
});

socket.on("disconnect", (reason) => {
  console.log("disconnected:", reason);
});
