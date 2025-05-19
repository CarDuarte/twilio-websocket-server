import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import fetch from "node-fetch";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/media-stream" });

wss.on("connection", (ws, req) => {
  console.log("🔍 req.url:", req.url);
  console.log("🔍 req.headers:", req.headers);
  const url = new URL(req.url ?? "", `http://${req.headers.host}`);
  const sessionId = url.searchParams.get("session");
  const host = req.headers.host;
  const fullPath = req.url;
  const queryFromHeader =
    req.headers["x-original-uri"] || req.headers["x-forwarded-uri"];

  console.log("🧩 Full URL path:", fullPath);
  console.log("🧩 Host path:", host);
  console.log("🧩 Query from header:", queryFromHeader);
  
  if (!sessionId) {
    console.error("❌ Missing session ID in WebSocket URL.");
    ws.close();
    return;
  }

  (ws as any).sessionId = sessionId;
  console.log("✅ Twilio stream connected with session:", sessionId);

  ws.on("message", async (message) => {
    const data = JSON.parse(message.toString());
    const event = data.event;

    if (event === "start") {
      console.log("🚀 Media stream started");
    } else if (event === "media") {
      // const audio = data.media.payload; // base64-encoded μ-law
      console.log("🎧 Received audio packet");

      // ✅ Fake transcript for now
      const fakeTranscript = "Hi, I need help with my student account.";
      const sessionId = (ws as any).sessionId;

      await sendTranscriptToSession(sessionId, fakeTranscript);
    } else if (event === "stop") {
      console.log("🛑 Stream ended");
    }
  });

  ws.on("close", () => {
    console.log("❌ Twilio stream disconnected");
  });
});

// ✅ Helper function to send message to OpenAI Realtime Agent session
async function sendTranscriptToSession(sessionId: string, message: string) {
  try {
    const response = await fetch(
      `https://api.openai.com/v1/realtime/sessions/${sessionId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "user",
          content: message,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Failed to send to session:", errorText);
    } else {
      console.log("📤 Message sent to Realtime session:", message);
    }
  } catch (err) {
    console.error("❌ Error sending message:", err);
  }
}
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ WebSocket server listening on port ${PORT}`);
  console.log(
    "✅ WebSocket server running at https://twilio-websocket-server-xziu.onrender.com/media-stream"
  );
});
