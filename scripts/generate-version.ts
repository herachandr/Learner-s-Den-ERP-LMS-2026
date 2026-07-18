import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const targetVersion = process.env.APP_VERSION || '2.0.0';
const targetEnv = process.env.APP_ENV || 'Production';
const buildNum = process.env.BUILD_NUM || Math.floor(Math.random() * 1000 + 1000).toString();
const buildTime = new Date().toISOString().replace('T', ' ').substring(0, 16);

let commitSha = 'dev-rev';
try {
  commitSha = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
  commitSha = process.env.COMMIT_SHA || 'dev-rev';
}

const metadata = {
  version: targetVersion,
  buildNum: buildNum,
  buildTime: buildTime,
  env: targetEnv,
  commitSha: commitSha,
  updatePollingInterval: process.env.UPDATE_POLLING_INTERVAL || (targetEnv === 'Production' ? '300000' : '4000')
};

// Ensure directories exist
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync(path.join(process.cwd(), 'public/version.json'), JSON.stringify(metadata, null, 2));
console.log('✅ Generated public/version.json:', metadata);

// If dist exists, write there as well
if (fs.existsSync('dist')) {
  fs.writeFileSync(path.join(process.cwd(), 'dist/version.json'), JSON.stringify(metadata, null, 2));
  console.log('✅ Synchronized dist/version.json');
}
