import { spawn } from 'node:child_process';

const options = { stdio: 'inherit', shell: true };

console.log('Starting Backend...');
spawn('npm', ['run', 'dev', '--prefix', 'backend'], options);

console.log('Starting Frontend...');
spawn('npm', ['run', 'dev', '--prefix', 'frontend'], options);
