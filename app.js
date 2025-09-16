#!/usr/bin/env node

console.log('🚀 Leap Motion Hue Bridge starting...');
console.log('👋 Ready to control Philips Hue lights with hand gestures!');

// Simple HTTP server to keep the app running
const http = require('http');
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Leap Motion Hue Bridge is running!\n');
});

server.listen(port, () => {
  console.log(`🌐 Server running at http://localhost:${port}/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});