import { io } from "socket.io-client";

const url = "http://127.0.0.1:8080";

const socket = io(url, { autoConnect: false });

socket.on("message", function (data) {
  console.log(data);
});

// socket.on("disconnect", )

export { socket };
