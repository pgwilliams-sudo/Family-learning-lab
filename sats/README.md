# Kodjo's Year 6 SATs Practice Centre

This is a modular companion to Family Learning Lab at `/sats/`. It does **not** replace the existing adaptive fractions tutor. It is intended to be a low-pressure, repeatable **KS2 SATs-style** practice assessment aligned broadly with the English national curriculum and the six test components in 2027.

The 2027 national KS2 tests are scheduled for **10–13 May 2027**, in English grammar, punctuation and spelling; English reading; and mathematics arithmetic and two reasoning papers. English writing and science are teacher assessed, not separate statutory SATs exam papers.

Official source: https://www.gov.uk/government/publications/key-stage-2-assessment-and-reporting-arrangements-ara/2027-key-stage-2-assessment-and-reporting-arrangements

## Practice modules

| Module | Question count | Coverage |
| --- | ---: | --- |
| Daily SATs Challenge | 12 | 4 arithmetic, 3 reasoning, 2 grammar, 2 reading, 1 spelling |
| Maths: Arithmetic | 12 | Four operations, fractions, decimals, percentages, place value |
| Maths: Reasoning | 10 | Word problems, ratio, measurement, statistics |
| Fractions & Percentages | 10 | Focused arithmetic and fractions-of-quantity reasoning |
| Grammar & Punctuation | 12 | Word classes, tenses, clauses, punctuation, vocabulary |
| Reading Comprehension | 8 | Two original passages, four questions each |
| Spelling | 10 | Original contextual sentences and spoken word prompts |
| Extended Reading Paper | 12 | 2 original 400–460-word passages; 1-, 2- and 3-mark retrieval, inference, vocabulary and purpose questions |
| Extended Maths Reasoning | 9 | Parameterised multi-step problems worth 2 or 3 marks; final answer plus method |

Questions are original, not copied from official test papers. Most sample tests take 10–25 minutes. The Daily Challenge is a short formative practice test and **must not be described as an official mock paper or used to predict scaled SATs scores**. Official papers and mark schemes remain useful for occasional formal mocks: https://www.gov.uk/government/collections/national-curriculum-assessments-past-test-materials

## Extended written answers and multi-mark maths

The extended papers are independent optional modules. The standard 12-question Daily Challenge stays short and auto-marked.

- **Extended reading:** six original fiction and non-fiction passages (400–460 words each), with two passages selected per sitting. Each passage has two auto-marked questions and four written questions with an evidence-based 2- or 3-mark scheme.
- **Extended reasoning:** twelve parameterised 2- or 3-mark maths templates, nine different templates per sitting. A correct final number earns one deterministic mark; additional method marks require the learner's recorded working and a human judgement against explicit criteria. Acceptable alternative approaches should earn credit.
- **Marking:** once the test ends, the learner or preferably an adult reviews the written and method responses against model examples. They tick separate mark points and confirm each answer; the app cannot assign a final score until every response has been reviewed. Blank reading answers and maths working earn no rubric marks. This is guided practice marking, not official, verified SATs marking.
- **Resuming:** unmarked submissions are saved separately in browser localStorage, with a Resume marking action on the SATs home screen. No feedback or model answer is shown during the test.
- **Rewards:** written and method marks chosen by a learner do **not** award XP. XP is only credited for automatically verifiable answers, subject to the existing cap. Existing records and other learners are preserved.
- **Afterwards:** the review displays marks per question, examples and mark points. Any question missing one or more marks is treated as an opportunity for the existing Fix this skill routine. Results are clearly described as practice, not scaled scores.

Do not treat keyword matching, self-marked answers or the short extended papers as substitutes for professionally marked official test papers. Official STA mark schemes allow a range of acceptable responses and alternative mathematical methods that this simple rubric interface cannot fully encode.

## Design and modularity

- `content.js`, `reading-extra.js`, `english-extra.js`: original passages, English item banks, spelling prompts and module registry.
- `engine.js`, `reasoning-extra.js`: deterministic question generator, seed-based variation, expanded reasoning templates, recent-question avoidance, marking and per-skill breakdown.
- `extended-reading.js`, `extended-maths.js`: original longer texts, 1–3 mark response rubrics, parameterised method questions.
- `extended-marking.js`, `extended-review-ui.js`: guided evidence marking, partial credit and post-test review.
- `app.js`: question navigation, accessible input, saved tests and lessons, recommendations after submission and XP integration.
- `remediation.js`, `lesson-ui.js`: targeted mini-lessons, guided practice, two independent checks and three-day follow-up.
- `styles.css`, `index.html`: responsive self-contained HTML app, with path-relative assets for GitHub Pages.
- `engine.test.js`, `remediation.test.js`, `ui.test.js`: generator validity, assessment variety, targeted lessons, learner isolation and state persistence.
- `extended.test.js`, `extended-ui.test.js`: longer passage coverage, method scoring, resumable marking and preservation of separate learner records.

Maths uses new numerical parameters each time, including 16 additional reasoning templates for geometry, volume, scaling, coordinates, money, statistics, ratio and percentages. English draws from **54 grammar questions**, **70 spelling prompts** and **12 original passages** with four questions each. Each test avoids duplicates within its session and favours questions not recently used, but **a finite English bank will eventually repeat**. The next content milestone should add richer written responses, diagrams and more substantial comprehension passages.

Learner state is stored in the existing `family-learning-lab:v1` localStorage record under a new `sats` property. The existing `profiles`, `progress`, `sessions` and `rewards` fields are preserved. In-progress answers and skill lessons survive reload; finished results show topic weaknesses and worked feedback, and completed questions can earn points under the shared 100 XP/day policy. A missed question offers **Fix this skill**: a short explanation and worked example, one guided question with hints, and two distinct independent checks. Two independent successes schedule a three-day revisit; otherwise the component remains a revision target. Reading vocabulary and grammar vocabulary are tracked separately. No paid AI, logins, external database, telemetry or third-party libraries.

## Validation

Run from repository root with Node 20+:

```sh
npm test
npm run test:sats
```

Serve the repository from its root (`python3 -m http.server 8000`) and open `http://localhost:8000/sats/`.

### Before merging

1. Run tests and a physical mobile Safari/Chromium browser smoke test. Node integration tests simulate the completed test → lesson → review flow, but are not substitutes for device testing.
2. Test both a new learner and a learner with existing local v0.2 rewards and progress.
3. Confirm the main app still loads under GitHub Pages and its SATs navigation goes to the project-relative `./sats/` URL.
4. Review English questions with Kodjo's school/teacher if possible. This is practice content, not formal exam-standardised assessment.
5. Merge only after testing. Keep the working `main` and Pages deployment unchanged until ready.

## Future improvements

- Refine the personalised revision loop with more teacher-reviewed explanations, multi-level lessons and retention statistics.
- Expand maths geometry, fractions and multi-step reasoning; add diagrams and multi-mark working.
- Add longer reading passages, more inference/explanation tasks and optional adult-reviewed free text.
- Add paper-length timed practice calibrated to official paper structure, clearly labelled unofficial.
- Add parent-facing longitudinal trends and optional, low-pressure weekly missions.
- Add teacher-accessible content review and correction process.
