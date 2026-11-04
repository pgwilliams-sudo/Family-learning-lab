# Family Learning Lab · Codex starter

A family-first, modular adaptive tutor prototype. Built to grow with learners, not to grow a complicated backend before it's needed.

## What works in v0.1

- Separate profiles for Kodjo (Year 6) and Nico (Year 9); add more local learners in Parent view.
- Subject catalogue with Maths active and a clear path to add more subjects.
- A short skill-level fractions diagnostic followed by a targeted mini-lesson, guided practice, independent checks and delayed review.
- Visual fraction strips, worked explanations, contextual hints, a second try and independent-versus-supported result tracking.
- A prerequisite graph routes learners through equivalent fractions, common denominators and addition. Two independent checks establish readiness; hints and retries remain supported work.
- Parent view with per-component progress, tentative/likely misconception patterns, recommended exercises, review dates and recent sessions.
- Local-only persistence using browser `localStorage` and JSON data export.
- No adverts, leaderboard, unrestricted chat, analytics or API keys.

**Scope note:** This is an *adaptive, authored tutor prototype*, **not yet a live generative AI tutor**. All fraction maths is verified using deterministic code. The LLM integration should be a later server-side module with a clear interface and safeguards. The mastery percentage is an informal progress estimate, not a validated psychometric score.

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

The ordered prerequisite graph is **equivalent fractions → common denominators → adding unlike fractions**. The first component without independent checks becomes the mini-lesson target, followed by two guided questions and two separate test questions. Only two consecutive independent check answers establish security; supported answers still count as practice. A failed or supported check keeps the component open. Successful checks schedule a revisit three days later. Returning learners receive due retention checks, and a failed check reopens the prerequisite. New sessions use different examples based on prior question counts.

Progress remains in the existing localStorage format, keyed by learner and skill. Existing addition records are retained; historical mastery estimates alone do not establish component security. Incomplete sessions retain completed question outcomes but do not appear as completed sessions. Switching learners ends the active session without transferring answers.

The question bank and graph are deliberately small authored fraction content; progress is an informal learning indicator, not a clinical diagnosis or validated assessment.

### Browser integration tests

With Python Playwright and Chromium installed:

```sh
npm run test:browser
```

For a machine without these optional test tools, install `playwright` in a Python virtual environment and install Chromium using your platform package manager. The test uses `/usr/bin/chromium`, starts its own temporary local server, and checks retry feedback, confirmation, targeted teaching, hints, independent progression, mobile layout, persistence and learner isolation. The app and Node unit tests require no external packages or build step.

## Design approach

- **Subject modules:** `src/data/catalog.js` lists subjects and skills. Add more topic banks/modules without changing the page shell.
- **Assessment correctness:** `src/engine/fractions.js` owns exact fraction arithmetic, question selection, hints and worked solutions.
- **Adaptation:** `src/engine/adaptive.js` owns mastery calculation and the difficulty policy. This can become a richer skill/prerequisite graph later.
- **Tutor:** `src/tutor/feedback.js` is the authored tutoring adapter. Upgrade to server-side AI later, while *keeping evaluation deterministic*.
- **Persistence:** `src/storage.js` is the only local data layer. Replace with a small remote service for multi-device sync when needed.
- **UI:** `src/app.js`, `src/styles.css`. The plain ES module architecture avoids a build chain for a small app; Codex can migrate to React/TypeScript if justified by growth.

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
