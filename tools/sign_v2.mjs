import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const PRIVATE_KEY_PATH = '/media/linnyux/development/developing/PantryPilot/.cosign-keys/cosign.key';
const PLANS_DIR = '/media/linnyux/development/developing/PantryPilot/docs/plans';

function canonicalize(content) {
    // Strip header comment (lines 1-6)
    const lines = content.split('\n');
    const bodyLines = lines.slice(6);

    // Canonicalize body: trim lines, normalize whitespace
    return bodyLines
        .map(line => line.trim())
        .join('\n')
        .trim();
}

function signPlan(planPath) {
    const content = fs.readFileSync(planPath, 'utf8');
    const body = canonicalize(content);

    // Compute SHA256 Hash
    const hash = crypto.createHash('sha256').update(body).digest('hex');

    // Sign using ECDSA P-256
    const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
    const sign = crypto.createSign('SHA256');
    sign.update(body);
    sign.end();

    // Sign and get base64 signature
    const signature = sign.sign(privateKey, 'base64');

    // URL-safe base64 (43 chars) identity?
    // Let's see if we can derive a 43-char identity from the hash or signature.
    // A 32-byte hash in base64 is 43 chars (stripped padding).
    const hashBase64 = crypto.createHash('sha256').update(body).digest('base64url');

    console.log(`Plan: ${path.basename(planPath)}`);
    console.log(`Hash (hex): ${hash}`);
    console.log(`Signature (base64): ${signature}`);
    console.log(`Identity (base64url - 43 chars): ${hashBase64}`);

    return { hash, signature, identity: hashBase64, body };
}

const planFiles = [
    'PLAN_PANTRYPILOT_PHASE_0_V2.md',
    'PLAN_PANTRYPILOT_PHASE_1_V2.md'
];

planFiles.forEach(file => {
    const fullPath = path.join(PLANS_DIR, file);
    if (!fs.existsSync(fullPath)) {
        console.error(`File not found: ${fullPath}`);
        return;
    }

    const { hash, signature, identity, body } = signPlan(fullPath);

    // Construct signed plan content
    const signedContent = `<!--
ATLAS-GATE_PLAN_HASH: ${hash}
COSIGN_SIGNATURE: ${signature}
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

${body}`;

    const newPath = path.join(PLANS_DIR, `${identity}.md`);
    fs.writeFileSync(newPath, signedContent);
    console.log(`Saved signed plan to: ${newPath}`);
});
