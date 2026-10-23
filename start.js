const { spawn } = require('child_process');
const path = require('path');

console.log('🌿 Starting WasteWise Full-Stack Application...\n');

// 1. Start backend server
const serverProcess = spawn('npx', ['tsx', 'server.ts'], {
  cwd: path.join(__dirname, 'server'),
  shell: true,
  stdio: 'inherit'
});

serverProcess.on('error', (err) => {
  console.error('Server process error:', err);
});

// 2. Start Vite client dev server
const clientProcess = spawn('npm', ['run', 'dev', '--', '--host'], {
  cwd: path.join(__dirname, 'client'),
  shell: true,
  stdio: 'inherit'
});

clientProcess.on('error', (err) => {
  console.error('Client process error:', err);
});

const cleanup = () => {
  console.log('\nShutting down WasteWise processes...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
