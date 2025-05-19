import express from "express";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: "/media-stream" });

wss.on("connection", (ws, req) => {
  const url = new URL(req.url ?? "", `http://${req.headers.host}`);
  console.log(url);
  const sessionId = url.searchParams.get("session");

  console.log("✅ Twilio stream connected with session:", sessionId);

  ws.on("message", (msg) => {
    console.log("🎧 Received message:", msg.toString());
  });

  ws.on("close", () => {
    console.log("❌ WebSocket closed");
  });
});

// ✅ Make sure you use process.env.PORT on Railway
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ WebSocket server running on port ${PORT}`);
});
