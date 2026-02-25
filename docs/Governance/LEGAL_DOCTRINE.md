# LEGAL_DOCTRINE.md

Project: PantryPilot / Mealify  
Jurisdiction: New Zealand  
Status: Foundational Legal Guardrails (Phase 1)

---

## 1. DATA OWNERSHIP

Users retain ownership of:

- Household data
- Pantry data
- Meal preferences
- Shop history
- Uploaded receipts

System operates as data processor, not owner.

Household data is scoped by household_id.
Users cannot access data outside authorized household membership.

---

## 2. PRIVACY COMPLIANCE

Target compliance baseline:
New Zealand Privacy Act 2020

Principles enforced:

- Data minimization
- Purpose limitation
- Secure storage
- Access control
- Right to correction

No unnecessary personal data collected in Phase 1.

---

## 3. AUTHORIZATION MODEL

All data queries must include:
household_id

Backend must enforce:

- User-household membership validation
- No client-side trust

No cross-household data leakage permitted.

---

## 4. SCRAPING LEGAL POSITION

Multi-store price scraping must:

- Respect robots.txt where applicable.
- Avoid excessive request rates.
- Use scheduled daily fetch only.
- Avoid circumvention of paywalls.
- Avoid scraping authenticated user-specific data.

Scraping must not:

- Degrade store infrastructure.
- Violate store authentication systems.

Scraping runs via background jobs only.

---

## 5. PRICE DISPLAY DISCLAIMER

Displayed prices:

- Derived from automated scraping.
- Timestamped.
- Not guaranteed to reflect in-store pricing.

UI must display:

- "Prices last updated: <timestamp>"

---

## 6. LIABILITY LIMITATION

System provides:

- Meal planning suggestions
- Budget estimations
- Pantry tracking assistance

System does not:

- Guarantee nutritional outcomes
- Guarantee allergen safety
- Guarantee price accuracy
- Replace parental judgment

User remains responsible for:

- Ingredient verification
- Allergy management
- Final purchasing decisions

---

## 7. DATA RETENTION

Shop history retained unless user deletes account.

User can:

- Delete account
- Request data export
- Request data deletion

Ledger records remain intact until account deletion.

---

## 8. CHILD DATA HANDLING

Child profiles store:

- Name (or nickname)
- Preference weights
- Rotation history

No:

- Date of birth required
- School details required
- Sensitive health data required

Avoid collecting unnecessary child personal information.

---

## 9. FUTURE SAAS TRANSITION

Before public NZ SaaS launch:

- Formal privacy policy required.
- Terms of service required.
- Scraping risk review required.
- Hosting security audit required.

Phase 1 personal tool operates under minimal data exposure.

---

LEGAL STATUS: BASELINE COMPLIANCE MODEL
