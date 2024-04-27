const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const connect = require("./config/database-config");
const Chat = require("./models/chat");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
io.on("connection", (socket) => {
  socket.on("join_room", (data) => {
    socket.join(data.roomId);
  });
  socket.on("msg_send", async (data) => {
    const chat = await Chat.create({
      roomId: data.roomId,
      user: data.username,
      content: data.msg,
    });
    io.to(data.roomId).emit("msg_rcvd", data); // -> except the user who send will receive the msg
  });
});

app.set("view engine", "ejs");

app.use("/", express.static(__dirname + "/public"));

app.get("/chat/:roomId", async (req, res) => {
  const chats = await Chat.find({
    roomId: req.params.roomId,
  }).select("content user");
  res.render("index", {
    name: "Swaraj",
    id: req.params.roomId,
    chats: chats,
  });
});

server.listen(3000, async () => {
  console.log("Server Started");
  await connect();
  console.log("Mongodb connected.");
});
