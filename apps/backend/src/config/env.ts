import { existsSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const backendRoot = path.resolve(__dirname, '..', '..');
const workspaceRoot = path.resolve(backendRoot, '..', '..');

for (const envPath of [
  path.join(backendRoot, '.env'),
  path.join(workspaceRoot, '.env'),
]) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}
