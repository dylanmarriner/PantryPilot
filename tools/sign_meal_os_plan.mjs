import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const PRIVATE_KEY_PATH = '/media/linnyux/development1/developing/PantryPilot/.cosign-keys/cosign.key';
const PLAN_PATH = '/media/linnyux/development1/developing/PantryPilot/docs/plans/PLAN_PANTRYPILOT_MEAL_OS_v1.md';

const content = fs.readFileSync(PLAN_PATH, 'utf8');

// Strip out the inline hash line that was appended at the end
let body = content.replace(/\[SHA256_HASH:.*?\]\n?/g, '').trim() + '\n';

// In case the file already has the HTML comment header, strip that out too
if (body.startsWith('<!--')) {
    const lines = body.split('\n');
    const endIdx = lines.findIndex(l => l === '-->');
    if (endIdx !== -1) {
        body = lines.slice(endIdx + 1).join('\n').trim() + '\n';
    }
}

// Compute SHA256 Hash
const hash = crypto.createHash('sha256').update(body).digest('hex');

// Sign using ECDSA P-256
const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
const sign = crypto.createSign('SHA256');
sign.update(body);
sign.end();

const signature = sign.sign(privateKey, 'base64');

const signedContent = `<!--
ATLAS-GATE_PLAN_HASH: ${hash}
COSIGN_SIGNATURE: ${signature}
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

${body}`;

fs.writeFileSync(PLAN_PATH, signedContent);
console.log('Successfully signed the Meal OS Plan.');
console.log(`Plan Hash: ${hash}`);
