const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return '127.0.0.1';
}

const LOCAL_IP = getLocalIP();
const PORT = 3000;
const sessions = {};
const keystateFile = path.join(__dirname, '..', 'keystate.txt');

let keys = { a: false, d: false, w: false, s: false };

function writeKeystate() {
  const content = [keys.a?'1':'0', keys.d?'1':'0', keys.w?'1':'0', keys.s?'1':'0'].join('');
  fs.writeFileSync(keystateFile, content, 'utf8');
}
writeKeystate();

function generateCode() {
  let code;
  do { code = Math.floor(1000 + Math.random() * 9000).toString(); } while (sessions[code]);
  return code;
}

const httpServer = http.createServer((req, res) => {
  let urlPath = req.url === '/' ? '/index.html' : req.url;
  let filePath = path.join(__dirname, '../public', urlPath);
  const ext = path.extname(filePath);
  const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server: httpServer });

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === 'create_session') {
      const code = generateCode();
      // session supports up to 2 phones: gyro and pedal
      sessions[code] = { pc: ws, gyro: null, pedal: null };
      ws.sessionCode = code;
      ws.role = 'pc';
      ws.send(JSON.stringify({ type: 'session_created', code, ip: LOCAL_IP, port: PORT }));
      console.log(`[+] PC created session: ${code}`);
    }

    else if (msg.type === 'join_session') {
      const code = msg.code;
      const wantRole = msg.role; // 'gyro' or 'pedal'
      if (!sessions[code]) { ws.send(JSON.stringify({ type: 'error', message: 'Invalid code. Try again.' })); return; }
      
      // Check if that role is already taken
      if (sessions[code][wantRole]) {
        ws.send(JSON.stringify({ type: 'error', message: `A device is already using ${wantRole} mode.` }));
        return;
      }

      sessions[code][wantRole] = ws;
      ws.sessionCode = code;
      ws.role = wantRole;
      ws.send(JSON.stringify({ type: 'joined', role: wantRole }));
      
      // Notify PC which device connected
      sessions[code].pc?.send(JSON.stringify({ type: 'device_connected', role: wantRole }));
      console.log(`[+] ${wantRole} device joined session: ${code}`);
    }

    else if (msg.type === 'gyro') {
      const code = ws.sessionCode;
      if (!code || !sessions[code]) return;
      sessions[code].pc?.send(JSON.stringify(msg));
      const gamma = msg.gamma;
      const DEAD = 5;
      keys.a = gamma < -DEAD;
      keys.d = gamma > DEAD;
      writeKeystate();
    }

    else if (msg.type === 'pedal') {
      const code = ws.sessionCode;
      if (!code || !sessions[code]) return;
      sessions[code].pc?.send(JSON.stringify(msg));
      keys.w = !!msg.gas;
      keys.s = !!msg.brake;
      writeKeystate();
    }
  });

  ws.on('close', () => {
    const code = ws.sessionCode;
    if (!code || !sessions[code]) return;
    if (ws.role === 'pc') {
      sessions[code].gyro?.send(JSON.stringify({ type: 'pc_disconnected' }));
      sessions[code].pedal?.send(JSON.stringify({ type: 'pc_disconnected' }));
      delete sessions[code];
      keys = { a: false, d: false, w: false, s: false };
      writeKeystate();
      console.log(`[-] PC left, session ${code} closed`);
    } else {
      sessions[code][ws.role] = null;
      sessions[code].pc?.send(JSON.stringify({ type: 'device_disconnected', role: ws.role }));
      if (ws.role === 'gyro') { keys.a = false; keys.d = false; }
      if (ws.role === 'pedal') { keys.w = false; keys.s = false; }
      writeKeystate();
      console.log(`[-] ${ws.role} device left session ${code}`);
    }
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('\n  PhoneWheel is running!');
  console.log(`  Open on PC    ->  http://localhost:${PORT}`);
  console.log(`  Open on Phone ->  http://${LOCAL_IP}:${PORT}`);
  console.log('\n  Both devices must be on the same Wi-Fi.');
  console.log('  For keys to work in games, also run KEYS_BRIDGE.ahk\n');
});
