import express from "express";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/media-stream" });

wss.on("connection", (ws) => {
  console.log("🔌 Twilio stream connected");

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());
    const event = data.event;

    if (event === "start") {
      console.log("🚀 Media stream started");
    } else if (event === "media") {
      const audio = data.media.payload; // Base64-encoded μ-law
      // TODO: Transcribe audio and respond using AI
      console.log("🎧 Received audio packet", audio);
    } else if (event === "stop") {
      console.log("🛑 Stream ended");
    }
  });

  ws.on("close", () => {
    console.log("❌ Twilio stream disconnected");
  });
});

server.listen(3001, () => {
  console.log("WebSocket server running at ws://localhost:3001/media-stream");
});
