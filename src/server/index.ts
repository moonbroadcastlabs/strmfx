import express from "express";
import http from "http";
import ws from "ws";

// create static file server
const http_app = express();
http_app.use(express.static("dist/static"));

// create websocket server
const ws_app = new ws.Server({ noServer: true });

interface Channel {
  server: ws.WebSocketServer;
  connections: ws.WebSocket[];
}

const channels: { [id: string]: Channel } = {};

/*
 {
    "type": "SourceUpdate",
    "source": 0,
    "x": 100,
    "y": 100
  }

*/

function broadcast(message: string) {
  return function (ws: ws.WebSocket) {
    ws.send(message);
  };
}

function Channel(): Channel {
  const channel: Channel = {
    server: new ws.Server({ noServer: true }),
    connections: [],
  };

  function rebroadcast(message: ws.RawData) {
    channel.connections.forEach(broadcast(message.toString()));
  }

  channel.server.on("connection", function (ws) {
    channel.connections.push(ws);
    ws.on("message", rebroadcast);
  });

  return channel;
}

// setup http server
const port = process.env.PORT || 8080;

const server = http.createServer(http_app);

function parseUrl(url: string = "") {
  const parts = url.split("/");

  if (parts.length === 3 && parts[1] === "messagebus") {
    return parts[2];
  }
  return undefined;
}

server.on("upgrade", function (req, sock, head) {
  const channel = parseUrl(req.url);
  if (channel) {
    if (!channels[channel]) {
      channels[channel] = Channel();
    }
    const channelServer = channels[channel].server;

    channelServer.handleUpgrade(req, sock, head, function (ws) {
      channelServer.emit("connection", ws, req);
    });
  }
});

server.listen(port, () => console.log(`Listening port ${port}`));
