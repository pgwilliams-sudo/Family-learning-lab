# Family Learning Lab · Codex starter

A family-first, modular adaptive tutor prototype. Built to grow with learners, not to grow a complicated backend before it's needed.

## What works in v0.2

- Separate profiles for Kodjo (Year 6) and Nico (Year 9); add more local learners in Parent view.
- Subject catalogue with Maths active and a clear path to add more subjects.
- A short skill-level fractions diagnostic followed by a targeted mini-lesson, guided practice, independent checks and delayed review.
- Visual fraction strips, worked explanations, contextual hints, a second try and independent-versus-supported result tracking.
- A prerequisite graph routes learners through equivalent fractions, common denominators and addition. Two independent checks establish readiness; hints and retries remain supported work.
- Parent view with per-component progress, tentative/likely misconception patterns, recommended exercises, review dates and recent sessions.
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

## Diagnostic and remediation workflow

Start the maths diagnostic from Home. Each component gets its own question. A hint or mistake triggers a different confirmation question; a single wrong answer never establishes a misconception. Known patterns (changing only the denominator or adding denominators) are recorded as tentative until seen on a different question. Other errors are treated as possible calculation slips, not inferred misconceptions.

The ordered prerequisite graph is **equivalent fractions → common denominators → adding unlike fractions**. The first component without independent checks becomes the mini-lesson target, followed by two guided questions and two separate test questions. Only two consecutive independent check answers establish security; supported answers still count as practice. A failed or supported check keeps the component open. Successful checks schedule a revisit three days later. Returning learners receive due retention checks, and a failed check reopens the prerequisite. Question difficulty uses the current component mastery, not cumulative attempts or rewards. Year 6 has a level-3 ceiling; Year 9 can reach level 4, while either learner can revisit level-1 basics. Independent answers increase mastery; supported correct answers do not raise it. Denominators are bounded at 24, equivalent-fraction targets at 144, and generated answers fit the existing input limits. The selector avoids all questions seen in the current session and the last 12 completed questions per skill across sessions. Canonical question IDs stay the same across difficulty tiers to enforce these limits. The challenge thresholds are mastery 35, 55 and 80; rewards levels and cumulative question counts cannot raise them. Higher tiers use larger denominators, non-unit numerators and wider conversion factors. Questions matching the original starter retain their reward IDs, so existing daily XP credits remain effective.

Progress remains in the existing localStorage format, keyed by learner and skill, under the original `family-learning-lab:v1` storage key. Version-1 and version-2 saves migrate to version 2 without deleting diagnostic evidence, review dates, historical sessions, existing rewards or extra saved fields. Existing addition records are retained; historical mastery estimates alone do not establish component security. Incomplete sessions retain completed question outcomes but do not appear as completed sessions. Switching learners ends the active session without transferring answers.

The question bank and graph are deliberately small authored fraction content; progress is an informal learning indicator, not a clinical diagnosis or validated assessment.

### Browser integration tests

With Python Playwright and Chromium installed:

```sh
npm run test:browser
```

For a machine without these optional test tools, install `playwright` in a Python virtual environment and install Chromium using your platform package manager. The test uses `/usr/bin/chromium`, starts its own temporary local server, and checks retry feedback, confirmation, targeted teaching, hints, independent progression, mobile layout, persistence, learner isolation, daily reward caps, duplicate/legacy XP credits, reward levels, recent-question limits and Year 6/Year 9 challenge progression. The app and Node unit tests require no external packages or build step.

## Design approach

- **Subject modules:** `src/data/catalog.js` lists subjects and skills. Add more topic banks/modules without changing the page shell.
- **Assessment correctness:** `src/engine/fractions.js` owns exact fraction arithmetic, question selection, hints and worked solutions.
- **Questions:** `src/engine/questions.js` owns bounded, varied question pools, mastery-based difficulty and repeat exclusions. It has no storage, UI or rewards dependencies.
- **Rewards:** `src/engine/rewards.js` owns deterministic XP, badges, levels and daily limits, independently of assessment.
- **Adaptation:** `src/engine/adaptive.js` owns mastery calculation and the difficulty policy. This can become a richer skill/prerequisite graph later.
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
- v0.1 and v0.2 learner progress is preserved automatically in localStorage; data backups include separate rewards. XP is awarded only when a question outcome is final, not on opening a page, requesting a hint, invalid input or the first unsuccessful try. Completing a full remediation session awards the lesson badge once; abandoning a session does not.
- Challenge labels describe question difficulty; the reward level describes accumulated XP. Neither XP nor badges influences mastery or assessment correctness.

## Next milestones for Codex

1. **Extend the component graph.** Add simplification diagnostics and a broader authored question bank, including more misconception confirmation examples.
2. **More Maths units:** equivalent fractions, simplification, ratio, percentages, algebra. Add tests for each question bank and engine.
3. **English and Science:** subject-specific answer engines, such as rubric-assisted writing tasks, rather than forcing every subject into a maths-style right/wrong question.
4. **Optional remote sync:** small backend with learner accounts and basic access controls only when several devices/friends need shared data.
5. **AI tutor adapter:** a secure server endpoint, constrained instructions, safe/age-appropriate responses, no exposed API key, parent oversight and limits on personal data. The language model explains; verified question engines score.
6. **Broader browser coverage** for delayed review, additional question banks and accessibility.

## Privacy and deployment boundaries

Local browser progress is **not secure storage** and may be lost when browser data is cleared; use the JSON export. Anyone using this browser can switch profiles or see Parent view. That is a deliberate family-prototype simplification, **not** an appropriate access model for a publicly shared service. Do not store school identifiers, addresses, dates of birth, photos or sensitive data. No backend, login or cloud sync is included yet. There are no real AI requests or API usage charges in v0.1.

## Suggested Codex workflow

- Create a **new private GitHub repository** for this project; do not put it inside GymTrack or The Real Flag Hunters.
- Upload this starter project, open the repository with Codex and use `CODEX_BRIEF.md` as the project requirements.
- Ask Codex to work on a feature branch, test before committing, and open a PR for your review. Avoid automatic deployments.
