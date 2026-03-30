/**
 * CraftCater Collaboration Server
 *
 * Implements the y-websocket sync protocol directly using y-protocols + lib0,
 * bypassing the broken `bin/utils` export that was removed in y-websocket v2.
 *
 * Install:
 *   npm install ws yjs y-protocols lib0
 *
 * Run:
 *   node server.js
 *
 * WebSocket URL shape expected by the client:
 *   ws://localhost:4000/collab?room=menu-collab-{eventId}
 */

import { WebSocketServer } from 'ws';
import http from 'http';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

const PORT = process.env.PORT || 4000;

// ── Wire-protocol message type IDs (same as y-websocket) ─────────────────────
const MSG_SYNC      = 0;
const MSG_AWARENESS = 1;

// ── Room registry ─────────────────────────────────────────────────────────────
/**
 * rooms: Map<roomName, {
 *   doc       : Y.Doc,
 *   awareness : awarenessProtocol.Awareness,
 *   conns     : Map<WebSocket, Set<number>>   // ws → awarenessClientIds it owns
 * }>
 */
const rooms = new Map();

function getRoom(roomName) {
  if (rooms.has(roomName)) return rooms.get(roomName);

  const doc       = new Y.Doc({ gc: true });
  const awareness = new awarenessProtocol.Awareness(doc);
  const conns     = new Map();

  // When awareness changes, broadcast to every peer except the origin socket
  awareness.on('update', ({ added, updated, removed }, originWs) => {
    const changedClients = [...added, ...updated, ...removed];
    const enc = encoding.createEncoder();
    encoding.writeVarUint(enc, MSG_AWARENESS);
    encoding.writeVarUint8Array(
      enc,
      awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients),
    );
    const buf = encoding.toUint8Array(enc);
    conns.forEach((_, ws) => {
      if (ws !== originWs && ws.readyState === ws.OPEN) ws.send(buf);
    });
  });

  const room = { doc, awareness, conns };
  rooms.set(roomName, room);
  return room;
}

function removeConn(roomName, room, ws) {
  if (!room.conns.has(ws)) return;
  const ownedIds = room.conns.get(ws);
  room.conns.delete(ws);

  // Remove this client's awareness state so other peers see them leave
  awarenessProtocol.removeAwarenessStates(room.awareness, [...ownedIds], null);

  if (room.conns.size === 0) {
    room.doc.destroy();
    rooms.delete(roomName);
    console.log(`[room] "${roomName}" destroyed (empty)`);
  }
}

function send(ws, encoder) {
  if (ws.readyState === ws.OPEN) ws.send(encoding.toUint8Array(encoder));
}

function handleMessage(ws, roomName, room, rawData) {
  const { doc, awareness, conns } = room;
  const data    = rawData instanceof ArrayBuffer ? new Uint8Array(rawData) : rawData;
  const decoder = decoding.createDecoder(data);
  const msgType = decoding.readVarUint(decoder);

  if (msgType === MSG_SYNC) {
    const replyEnc = encoding.createEncoder();
    encoding.writeVarUint(replyEnc, MSG_SYNC);
    const syncType = syncProtocol.readSyncMessage(decoder, replyEnc, doc, null);

    // Send our reply if we have one (step1 triggers step2 reply)
    if (encoding.length(replyEnc) > 1) send(ws, replyEnc);

    // After a client sends step2 (their full state), forward it to all other peers
    if (syncType === syncProtocol.messageYjsSyncStep2) {
      conns.forEach((_, peer) => {
        if (peer !== ws && peer.readyState === peer.OPEN) peer.send(data);
      });
    }
    return;
  }

  if (msgType === MSG_AWARENESS) {
    const update = decoding.readVarUint8Array(decoder);

    // Apply update and track which clientIds this socket is now managing
    awarenessProtocol.applyAwarenessUpdate(awareness, update, ws);

    // Record ownership — needed so we can clean up on disconnect
    if (!conns.has(ws)) conns.set(ws, new Set());
    awareness.getStates().forEach((_, clientId) => {
      // heuristic: attribute new IDs seen after applyAwarenessUpdate to this socket
      conns.get(ws).add(clientId);
    });

    // Forward raw update to all other peers
    conns.forEach((_, peer) => {
      if (peer !== ws && peer.readyState === peer.OPEN) {
        const enc = encoding.createEncoder();
        encoding.writeVarUint(enc, MSG_AWARENESS);
        encoding.writeVarUint8Array(enc, update);
        peer.send(encoding.toUint8Array(enc));
      }
    });
    return;
  }

  console.warn(`[server] unknown msgType=${msgType} room=${roomName}`);
}

// ── HTTP server (health-check + WS upgrade) ───────────────────────────────────
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      rooms: [...rooms.entries()].map(([name, r]) => ({
        name,
        peers: r.conns.size,
      })),
    }));
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const url      = new URL(req.url, `http://localhost:${PORT}`);
  const roomName = url.searchParams.get('room') || 'default';
  const room     = getRoom(roomName);

  ws.binaryType = 'arraybuffer';

  // Register the connection (awareness IDs populated lazily on first MSG_AWARENESS)
  room.conns.set(ws, new Set());

  // 1. Send our sync step-1 so the client can respond with its current doc state
  const step1Enc = encoding.createEncoder();
  encoding.writeVarUint(step1Enc, MSG_SYNC);
  syncProtocol.writeSyncStep1(step1Enc, room.doc);
  send(ws, step1Enc);

  // 2. Send existing awareness states so the new client sees who is already online
  const existingStates = room.awareness.getStates();
  if (existingStates.size > 0) {
    const awEnc = encoding.createEncoder();
    encoding.writeVarUint(awEnc, MSG_AWARENESS);
    encoding.writeVarUint8Array(
      awEnc,
      awarenessProtocol.encodeAwarenessUpdate(room.awareness, [...existingStates.keys()]),
    );
    send(ws, awEnc);
  }

  ws.on('message', (data) => {
    try {
      handleMessage(ws, roomName, room, data);
    } catch (err) {
      console.error(`[server] handleMessage error room=${roomName}:`, err);
    }
  });

  ws.on('close', () => {
    removeConn(roomName, room, ws);
    console.log(`[-] disconnected  room=${roomName}  peers=${room.conns.size}`);
  });

  ws.on('error', (err) => console.error(`[ws error] room=${roomName}`, err.message));

  console.log(`[+] connected     room=${roomName}  peers=${room.conns.size}`);
});

server.listen(PORT, () => {
  console.log(`\n🍽️  CraftCater Collaboration Server`);
  console.log(`   WebSocket → ws://localhost:${PORT}/collab?room=menu-collab-{eventId}`);
  console.log(`   Health    → http://localhost:${PORT}/health\n`);
});

process.on('SIGINT', () => {
  console.log('\nShutting down…');
  wss.close(() => server.close(() => process.exit(0)));
});