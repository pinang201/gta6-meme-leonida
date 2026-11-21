// Entry program for make.fun's "Post a GTA 6 meme on X" bounty (gta6-meme-x-01),
// rewritten for this entry: same contract as the kit's starter, stricter checks.
//
// The post on X is the entry; this program's one job is to hand the grader the
// address of that post. It reads POST.json from the repository root (the bot
// directory), confirms the file really is a JSON object naming an X post
// (https://x.com/<handle>/status/<id>), and writes the file, byte for byte, to
// POST.json in the output directory. Nothing is printed on success, and the
// program touches nothing outside those two directories, so two runs always
// produce the same bytes.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

let raw = '';
try {
  raw = readFileSync(join(botDir, 'POST.json'), 'utf8');
} catch {
  fail('POST.json could not be read from the repository root');
}

let parsed: unknown = null;
try {
  parsed = JSON.parse(raw);
} catch {
  fail('POST.json is not valid JSON');
}
if (typeof parsed !== 'object' || parsed === null) {
  fail('POST.json is not a JSON object');
}

const url = (parsed as { url?: unknown }).url;
const isPostUrl =
  typeof url === 'string' &&
  /^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/[0-9]+$/.test(url);
if (!isPostUrl) {
  fail('POST.json does not name an X post (expected https://x.com/<handle>/status/<id>)');
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'POST.json'), raw);
