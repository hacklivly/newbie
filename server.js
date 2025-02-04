require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

let onlineUsers = {}; // Stores online users

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user-online", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("update-online-users", Object.keys(onlineUsers));
  });

  socket.on("call-user", ({ callerId, receiverId, signalData }) => {
    if (onlineUsers[receiverId]) {
      io.to(onlineUsers[receiverId]).emit("incoming-call", { callerId, signalData });
    }
  });

  socket.on("accept-call", ({ callerId, signalData }) => {
    if (onlineUsers[callerId]) {
      io.to(onlineUsers[callerId]).emit("call-accepted", signalData);
    }
  });

  socket.on("disconnect", () => {
    for (const user in onlineUsers) {
      if (onlineUsers[user] === socket.id) {
        delete onlineUsers[user];
      }
    }
    io.emit("update-online-users", Object.keys(onlineUsers));
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
