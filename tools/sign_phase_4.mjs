import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const PRIVATE_KEY_PATH = '/media/linnyux/development/developing/PantryPilot/.cosign-keys/cosign.key';
const PLANS_DIR = '/media/linnyux/development/developing/PantryPilot/docs/plans';
const TARGET_PLAN = 'PLAN_PANTRYPILOT_PHASE_4_V1.md';

function canonicalize(content) {
    // Strip header comment (lines 1-8 based on my current PHASE_4 draft)
    // Actually, let's look at my specific draft. It's lines 1-7.
    /*
    <!--
    ATLAS-GATE_PLAN_HASH: ...
    ATLAS-GATE_PLAN_SIGNATURE: PENDING_SIGNATURE
    COSIGN_SIGNATURE: PENDING_SIGNATURE
    ROLE: ANTIGRAVITY
    STATUS: APPROVED
    -->
    */
    const lines = content.split('\n');
    let headerEnd = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('-->')) {
            headerEnd = i;
            break;
        }
    }

    if (headerEnd === -1) throw new Error("Header not found");

    const bodyLines = lines.slice(headerEnd + 1);

    // Canonicalize body: trim lines, normalize whitespace
    return bodyLines
        .map(line => line.trim())
        .join('\n')
        .trim();
}

const planPath = path.join(PLANS_DIR, TARGET_PLAN);
const content = fs.readFileSync(planPath, 'utf8');
const body = canonicalize(content);

// Compute SHA256 Hash (should match the one I already put in)
const hash = crypto.createHash('sha256').update(body).digest('hex');

// Sign using ECDSA
const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
const sign = crypto.createSign('SHA256');
sign.update(body);
sign.end();
const signature = sign.sign(privateKey, 'base64');

// Identity for file name
const identity = crypto.createHash('sha256').update(body).digest('base64url');

console.log(`Plan: ${TARGET_PLAN}`);
console.log(`Hash (hex): ${hash}`);
console.log(`Signature: ${signature}`);
console.log(`Identity: ${identity}`);

const signedContent = `<!--
ATLAS-GATE_PLAN_HASH: ${hash}
ATLAS-GATE_PLAN_SIGNATURE: PENDING_SIGNATURE
COSIGN_SIGNATURE: ${signature}
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

${body}`;

// Update the original file
fs.writeFileSync(planPath, signedContent);
console.log(`Updated: ${planPath}`);

// Create the identity-named file
const idPath = path.join(PLANS_DIR, `${identity}.md`);
fs.writeFileSync(idPath, signedContent);
console.log(`Created: ${idPath}`);
