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

    return { hash, signature, body };
}

const pendingFiles = [
    'ec364d6a01e26d7e9143bc1e708ba780867dd84b10c64c3a014a180a3303c209.md',
    '7b60c50cbd4bbadb95bb4a194732b00f63f9c028e5241aaf687e7867cc2f79df.md',
    '86ab8ca7e1ecbb165c212d1fb58b86f51e662ef56d716ee3cbb11ea0897d968d.md'
];

pendingFiles.forEach(file => {
    const fullPath = path.join(PLANS_DIR, file);
    if (!fs.existsSync(fullPath)) {
        console.error(`File not found: ${fullPath}`);
        return;
    }

    const { hash, signature, body } = signPlan(fullPath);

    // Construct signed plan content
    const signedContent = `<!--
ATLAS-GATE_PLAN_HASH: ${hash}
COSIGN_SIGNATURE: ${signature}
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

${body}`;

    fs.writeFileSync(fullPath, signedContent);
    console.log(`Signed and updated: ${file}`);
    console.log(`New Hash (hex): ${hash}`);

    // Also update readable names if they exist and are pending
    const planIdMap = {
        'ec364d6a01e26d7e9143bc1e708ba780867dd84b10c64c3a014a180a3303c209.md': 'PLAN_PANTRYPILOT_PHASE_2_V1.md',
        '7b60c50cbd4bbadb95bb4a194732b00f63f9c028e5241aaf687e7867cc2f79df.md': 'PLAN_PANTRYPILOT_PHASE_1_V1.md',
        '86ab8ca7e1ecbb165c212d1fb58b86f51e662ef56d716ee3cbb11ea0897d968d.md': 'PLAN_PANTRYPILOT_PHASE_0_V1.md'
    };

    const humanName = planIdMap[file];
    if (humanName) {
        const humanPath = path.join(PLANS_DIR, humanName);
        if (fs.existsSync(humanPath)) {
            fs.writeFileSync(humanPath, signedContent);
            console.log(`Updated human-readable plan: ${humanName}`);
        }
    }
});
