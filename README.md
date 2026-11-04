# Family Learning Lab · Codex starter

A family-first, modular adaptive tutor prototype. Built to grow with learners, not to grow a complicated backend before it's needed.

## Kodjo's KS2 SATs Practice Centre

The app now includes a separate [SATs Practice Centre](./sats/) with a repeatable 12-question daily mixed challenge, focused maths arithmetic/reasoning/fractions, grammar, reading and spelling practice. Questions vary by seed; recent IDs are avoided where possible. Results identify weaker components and share the existing per-child rewards and browser storage without a backend. This is **original SATs-style practice**, not a published STA paper or an official predicted grade. See [SATs module documentation](./sats/README.md) and run `npm run test:sats`. The SATs route uses relative paths so GitHub Pages serves it under the repository subpath.

## What works in v0.2

- Separate profiles for Kodjo (Year 6) and Nico (Year 9); add more local learners in Parent view.
- Subject catalogue with Maths active and a clear path to add more subjects.
- A six-question, roughly 15-minute guided maths lesson on adding fractions with different denominators.
- Visual fraction strips, worked explanations, contextual hints, a second try and independent-versus-supported result tracking.
- Difficulty adjusts during a session. It also starts at a different level next time based on estimated mastery.
- Parent view with per-learner progress, attempts, hints and recent completed sessions.
- Local-only persistence using browser `localStorage` and JSON data export.
- A modular **XP and badge system**: independent answers (+12 XP), supported answers (+6 XP), perseverance after a challenging question (+2 XP) and a harder independent question (+4 bonus XP). First-step, independent-thinker, persistence, return-to-learning, lesson-completion and mastery badges.
- Daily 100 XP cap and no duplicate XP for the same question on the same local day, while retaining full teaching/practice. A question can earn XP again on another day to encourage spaced review. Each learner has their own points, level, badges and history.
- No adverts, public leaderboard, unrestricted chat, analytics or API keys.

**Scope note:** This is an *adaptive, authored tutor prototype*, **not yet a live generative AI tutor**. All fraction maths is verified using deterministic code. The LLM integration should be a later server-side module with a clear interface and safeguards. The mastery percentage is an informal progress estimate, not a validated psychometric score. **XP is motivational, not a measure of intelligence, ability or academic attainment.**

## Run locally

From the project folder, run:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000` in a browser. You can use any static local server; the project has no external dependencies.

Run tests using Node 20+:

```sh
npm test
```

For an iPad, the app needs to be hosted on a reachable HTTPS site to use it directly there. Don't publish a publicly accessible children's app without suitable safeguards.

## Design approach

- **Subject modules:** `src/data/catalog.js` lists subjects and skills. Add more topic banks/modules without changing the page shell.
- **Assessment correctness:** `src/engine/fractions.js` owns exact fraction arithmetic, question selection, hints and worked solutions.
- **Adaptation:** `src/engine/adaptive.js` owns mastery calculation and the difficulty policy. `src/engine/rewards.js` separately owns deterministic XP, badges, levels and limits. This can become a richer skill/prerequisite graph later.
- **Tutor:** `src/tutor/feedback.js` is the authored tutoring adapter. Upgrade to server-side AI later, while *keeping evaluation deterministic*.
- **Persistence:** `src/storage.js` is the only local data layer. Replace with a small remote service for multi-device sync when needed.
- **UI:** `src/app.js`, `src/styles.css`. The plain ES module architecture avoids a build chain for a small app; Codex can migrate to React/TypeScript if justified by growth.

## Gamification behaviour

- Independently correct first attempt, no hints: **12 XP** (plus **4 XP** for difficulty 3–4).
- Correct after a hint or a second attempt: **6 XP**.
- Still learning after two tries: **2 XP** for perseverance.
- Once-per-question-per-day rewards; up to **100 XP per local day**; **100 XP per level**. It is always possible to practise after reaching the cap.
- Badges recognise first question, five independent answers, five supported/challenging questions, three distinct practice days, completing a lesson, and reaching 75% estimated mastery in a skill. Badges are awarded once, per child.
- No shared rankings or guilt-inducing daily-streak resets. Points do not affect adaptive difficulty or mastery.
- v0.1 learner progress is preserved automatically in localStorage; data backups now include separate rewards.

## Next milestones for Codex

1. **Proper skill dependency graph.** Tag diagnostic question misconceptions (unlike denominators vs equivalent fractions vs simplification), offer a targeted prerequisite mini-lesson, and test retention days later.
2. **More Maths units:** equivalent fractions, simplification, ratio, percentages, algebra. Add tests for each question bank and engine.
3. **English and Science:** subject-specific answer engines, such as rubric-assisted writing tasks, rather than forcing every subject into a maths-style right/wrong question.
4. **Optional remote sync:** small backend with learner accounts and basic access controls only when several devices/friends need shared data.
5. **AI tutor adapter:** a secure server endpoint, constrained instructions, safe/age-appropriate responses, no exposed API key, parent oversight and limits on personal data. The language model explains; verified question engines score.
6. **Gamified learning expansion:** make new subject modules emit verified outcome events to the shared rewards engine. Add optional earned rewards for retained mastery, parent-adjustable rewards and non-competitive weekly goals, without incentivising rapid guessing.
7. **Browser integration tests** for checking, retrying, switching learner and saving progress. Don't conflate a hint-assisted answer with independent mastery.

## Privacy and deployment boundaries

Local browser progress is **not secure storage** and may be lost when browser data is cleared; use the JSON export. Anyone using this browser can switch profiles or see Parent view. That is a deliberate family-prototype simplification, **not** an appropriate access model for a publicly shared service. Do not store school identifiers, addresses, dates of birth, photos or sensitive data. No backend, login or cloud sync is included yet. There are no real AI requests or API usage charges in v0.1.

## Suggested Codex workflow

- Create a **new private GitHub repository** for this project; do not put it inside GymTrack or The Real Flag Hunters.
- Upload this starter project, open the repository with Codex and use `CODEX_BRIEF.md` as the project requirements.
- Ask Codex to work on a feature branch, test before committing, and open a PR for your review. Avoid automatic deployments.
