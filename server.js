import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cluster from 'cluster';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const NUM_WORKERS = Math.min(os.cpus().length, 4);

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

let workerRequestCount = 0;

if (cluster.isPrimary) {
  console.log(`\n======================================================`);
  console.log(`✨ Astrotalk Rebuilt App — Load Balancer Online!`);
  console.log(`⚖️ Primary Load Balancer Master PID: ${process.pid}`);
  console.log(`🚀 Spawning ${NUM_WORKERS} worker processes for round-robin load balancing...`);
  console.log(`🌐 Open in your browser: http://localhost:${PORT}`);
  console.log(`📊 Load Balancer Status API: http://localhost:${PORT}/api/load-balancer`);
  console.log(`======================================================\n`);

  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`⚠️ Worker PID ${worker.process.pid} exited (${signal || code}). Auto-recovering new worker...`);
    cluster.fork();
  });
} else {
  const server = http.createServer((req, res) => {
    workerRequestCount++;
    let reqPath = req.url.split('?')[0];

    // Load Balancer Monitoring Endpoint
    if (reqPath === '/api/load-balancer') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'X-Load-Balancer-Worker': String(process.pid)
      });
      res.end(JSON.stringify({
        status: 'online',
        mode: 'Cluster Round-Robin Load Balancer',
        primaryPid: process.ppid,
        currentWorkerPid: process.pid,
        totalWorkerCores: NUM_WORKERS,
        requestsHandledByThisWorker: workerRequestCount,
        systemCpus: os.cpus().length,
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString()
      }, null, 2));
      return;
    }

    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    const filePath = path.join(__dirname, reqPath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 Not Found</h1>', 'utf-8');
        } else {
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'X-Load-Balancer-Worker': String(process.pid)
        });
        res.end(content, 'utf-8');
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`  [Worker PID ${process.pid}] Ready and taking balanced traffic on port ${PORT}`);
  });
}

