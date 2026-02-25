## RAW SYNC METADATA

Project: AI Chef / Budget Meal Planner Model
Thread Type: Historical Consolidation
Classification: RAW_SYNC
Date of Extraction: 2026-02-25

---

## 1. PROJECT INTENT

Create a very small generic AI model that can be trained as a chef to:

- Suggest meals
- Suggest lunches
- Help with meal prep
- Help buy food for a week within a budget

---

## 2. DECISIONS MADE

- The model does not need to be large.
- This is a constraint reasoning problem, not general intelligence.
- Do not train from scratch.
- Avoid using 7B+ models unless necessary.
- Prefer small models under 4B parameters.
- Use a small LLM combined with structured data.
- Use a rule engine to enforce budget and constraints.
- Prefer Phi-3 Mini as primary recommendation.
- TinyLlama is acceptable for Raspberry Pi deployment.
- Gemma 2B is a viable alternative.
- Avoid brute-force "chef intelligence."
- Prefer strong prompting over heavy fine-tuning.
- Use structured ingredient database (JSON).
- Use deterministic validation layer after generation.
- Support budget cap enforcement (example: $120, $150).
- Support dietary rules.
- Support pantry awareness.
- Support dislikes filtering.
- Output must include:
  - 7 dinners
  - 5 school lunches
  - Batch prep plan
  - Consolidated shopping list
  - Estimated cost breakdown
  - Cheaper alternatives

- SQLite recommended for ingredient and pricing storage.
- Python rule engine recommended.
- Quantized models preferred for low RAM systems.
- Raspberry Pi 5 (8GB) considered viable target.
- Architecture: small model + ingredient DB + rule layer.
- Fine-tuning is optional, not required.

---

## 3. ARCHITECTURE CHOICES

- Small local LLM (3.8B or smaller).
- Preferred model: Phi-3 Mini (3.8B).
- Alternative model: TinyLlama (1.1B).
- Alternative model: Gemma 2B.
- Quantized model variants (Q4).
- Structured ingredient database in JSON.
- SQLite for pricing and macro data.
- Deterministic rule engine for:
  - Budget enforcement
  - Meal count enforcement
  - Time constraints

- Separation of:
  - Generation layer (LLM)
  - Validation layer (rule engine)

- Constraint-engineered AI approach.
- Optional Telegram grocery reminder bot.
- Designed to run locally.
- No requirement for large cloud infrastructure.
- Suitable for Raspberry Pi 5 (8GB).
- System prompt + tool-calling architecture.
- Use of substitution matrix logic.

---

## 4. FEATURE DEFINITIONS

- Weekly meal planning (7 dinners).
- School lunch planning (5 lunches).
- Budget-aware grocery planning.
- Batch meal prep plan generation.
- Consolidated grocery list output.
- Cost estimation breakdown.
- Cheaper alternative suggestions.
- Ingredient substitution suggestions.
- Macro tracking potential.
- Pantry-aware planning.
- Dietary rule filtering.
- Kid dislike filtering.
- Prep time constraints (example: max 30 minutes).
- Budget ceiling enforcement.
- Family size awareness.
- Structured output formatting.

---

## 5. CONSTRAINTS IDENTIFIED

- Must run on small hardware (Raspberry Pi 5 8GB).
- Prefer small models under 4B parameters.
- Avoid expensive infrastructure.
- Avoid training from scratch.
- Avoid large 7B+ models unless needed.
- Memory limitations on low-power hardware.
- Budget constraints must be enforceable.
- Must operate with structured ingredient pricing data.
- Model must handle deterministic constraints.
- Avoid overengineering.
- No requirement for cloud-scale deployment.
- Avoid brute-force culinary creativity approach.

---

## 6. REJECTED IDEAS

- Training a giant 7B+ model.
- Training from scratch.
- Building a purely generative "chef intelligence" model.
- Relying solely on LLM without structured data.
- Brute-forcing creativity instead of constraint logic.
- Overengineering large AI infrastructure.

---

## 7. OPEN QUESTIONS

- Is this for personal use?
- Is this a product?
- Is this part of PantryPilot?
- Is this intended for sale?
- Is this specifically for Raspberry Pi deployment?
- Is fine-tuning required?
- Will it integrate with external messaging platforms?
- Will it be embedded or consumer-facing?

---

## 8. POTENTIAL CANON CANDIDATES

- Small-model-first philosophy.
- Constraint-engineered AI pattern (LLM + rule engine).
- Generation layer separated from deterministic validation layer.
- Ingredient database as structured system backbone.
- Budget-first enforcement logic.
- Avoid training from scratch rule.
- Avoid 7B+ models unless strictly required.
- Prefer quantized local deployment.
- Raspberry Pi viability as architectural constraint.
- Strong prompting over fine-tuning bias.
- Structured output enforcement.
- Substitution matrix logic layer.
- SQLite + Python rule engine pattern.
- Constraint solver framing over creativity framing.

---

## 9. POTENTIAL DECISION LOG ENTRIES

2026-02-25 – Small LLM (<4B) selected as architectural baseline for AI Chef system.
2026-02-25 – Training from scratch rejected.
2026-02-25 – 7B+ models rejected unless required for advanced creativity.
2026-02-25 – Phi-3 Mini designated primary model candidate.
2026-02-25 – TinyLlama accepted for Raspberry Pi deployment option.
2026-02-25 – Gemma 2B accepted as alternative small model.
2026-02-25 – Architecture defined as LLM + structured ingredient DB + rule engine.
2026-02-25 – Deterministic validation layer required after generation.
2026-02-25 – Weekly output structure standardized (7 dinners, 5 lunches, prep plan, cost breakdown, shopping list).
2026-02-25 – Quantized models preferred for low-memory environments.

---

End of extraction.
