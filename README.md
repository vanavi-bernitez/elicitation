# Listener — A Music Taste Portrait

A web app that asks you 8 questions about your music taste, then uses Claude AI to build a personal taste profile and evaluate new music against it.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- An [Anthropic API key](https://console.anthropic.com/)

## Setup

1. **Clone the repo and navigate to the project folder:**
   ```bash
   git clone https://github.com/vanavi-bernitez/elicitation.git
   cd elicitation/music-profiler
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create your `.env` file:**
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and fill in your values:
   ```
   VITE_ANTHROPIC_API_KEY=sk-ant-...
   VITE_CLAUDE_MODEL=claude-sonnet-4-6
   ```

4. **Start the dev server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Prompt Evaluation

A standalone eval script tests whether Claude's profile-building and evaluation prompts behave correctly across synthetic personas with known taste.

### How to run

```bash
cd music-profiler
node --env-file=.env test/eval.mjs
```

No extra dependencies — uses Node's native `fetch` (requires Node 18+).

### What it tests

The script defines 3 synthetic listener personas, each with pre-written answers to all 8 questions and a clear musical identity. For each persona it:

1. Calls Claude to generate a taste profile using the same system prompt as the app
2. Runs evaluations on 4 songs — 2 expected fits, 2 expected misfits — using the same evaluation prompt as the app
3. Prints a structured report: persona → profile → song evaluations with expected vs. actual judgment

| Persona | Expected fits | Expected misfits |
|---|---|---|
| Indie Folk Purist | Sufjan Stevens – Illinois, Bon Iver – For Emma | Daft Punk – Random Access Memories, Taylor Swift – 1989 |
| Jazz-Head | Miles Davis – Kind of Blue, Coltrane – A Love Supreme | Ed Sheeran – ÷, Billie Eilish – HappierThanEver |
| Emotional Pop Listener | Lorde – Pure Heroine, Phoebe Bridgers – Punisher | Aphex Twin – Selected Ambient Works Vol. II, Death Grips – The Money Store |

### Results (claude-sonnet-4-6)

**Indie Folk Purist**

Profile generated: *"Devoted Contextualist with a secret hunger for directness"* — correctly identified emotional honesty as the core value over genre. Surfaced the tension between the persona's sophisticated aesthetic identity and their instinct for naked, unambiguous feeling (evidenced by the Carrie Underwood admission).

| Song | Expected | Result |
|---|---|---|
| Sufjan Stevens – Illinois | fit | ✓ Correctly identified as a near-perfect match; cited emotional architecture and unguarded grief |
| Bon Iver – For Emma, Forever Ago | fit | ✓ Matched via isolation/grief texture and Hejira parallel |
| Daft Punk – Random Access Memories | misfit | ✓ Flagged as performing warmth rather than generating it; "too pleased with the museum they've built" |
| Taylor Swift – 1989 | misfit | ✓ Called a "partial miss" — noted production performs feeling rather than inhabiting it; suggested *Folklore* as the better match |

**Jazz-Head**

Profile generated: *"Structural Empiricist with a suppressed instinct for groove"* — correctly surfaced the tension between structural ideology and the body's response to tight rhythm sections (Paramore admission). Predicted ECM, Mingus, and West African music as likely loves.

| Song | Expected | Result |
|---|---|---|
| Miles Davis – Kind of Blue | fit | ✓ Cited modal framework as architectural conversation; noted the rhythm section works below the level of aesthetics |
| John Coltrane – A Love Supreme | fit | ✓ Validated via suite structure as load-bearing architecture; noted resistance to mythology around the record |
| Ed Sheeran – ÷ | misfit | ✓ Rejected for polished erasure and constructed intimacy |
| Billie Eilish – HappierThanEver | misfit | ~ Nuanced: title track's structural shift was credited, but the album overall failed the "Sgt. Pepper's myth problem" test |

**Emotional Pop Listener**

Profile generated: *"Music as emotional infrastructure"* — correctly diagnosed immediacy as the core requirement, traced it to '90s maximal balladry imprinting, and identified the hidden severity behind the casual listening posture.

| Song | Expected | Result |
|---|---|---|
| Lorde – Pure Heroine | fit | ~ Flagged as a partial mismatch — Lorde's studied restraint conflicts with this persona's need for emotional immediacy. Reasonable disagreement. |
| Phoebe Bridgers – Punisher | fit | ✓ Strong match; cited emotional transparency and the "I Know the End" eruption as equivalent to the Opeth dynamic |
| Aphex Twin – Selected Ambient Works Vol. II | misfit | ✓ Correctly rejected; "texture over feeling, atmosphere over arrival" |
| Death Grips – The Money Store | misfit | ✓ Correctly rejected; "explodes sideways into chaos rather than upward into catharsis" |

**Overall:** Profiles are values-based and non-generic. Evaluations consistently reference specific profile qualities. Claude shows calibrated judgment rather than mechanical fit/misfit labeling — notably calling out Lorde's restraint as a genuine tension point and treating the Billie Eilish result as uneven rather than a flat misfit.
