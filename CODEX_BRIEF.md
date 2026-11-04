# Codex project brief: Family Learning Lab

We are building a small private tutoring app for two children, Kodjo (Year 6) and Nico (Year 9), potentially shared later with a few known friends. It should remain useful as the children advance through school. Prioritise modularity, accurate subject content, quality tutoring, good mobile/tablet UX, and evidence of learning. Avoid enterprise-style security, sync conflicts, complicated infrastructure, speculative abstractions and premature scale. Keep appropriate baseline privacy and access safeguards before any public/friends deployment.

The starter project is a working browser-only v0.1. Read `README.md`, inspect the source and run `npm test` before making changes.

## Product principles

1. Assess the **smallest skill** rather than treating an entire subject as weak.
2. Diagnose **why** an answer is wrong: misconception, arithmetic slip, missing prerequisite or careless error. Support this with known answer patterns and follow-up checks, not only AI inference.
3. Teach with short, age-appropriate explanations, visual models, worked examples and hints. Let the learner attempt a second time before showing the full solution.
4. Move up after **independent**, repeated success; drop down or remediate after difficulty. Measure delayed retention, not just immediate accuracy.
5. Support multiple age groups and all subjects via independent curriculum/skill/assessment modules; no hard-coded assumptions that every question is a fraction.
6. Give parent concise summaries and suggested next actions. Avoid points or games that encourage guessing rather than learning.
7. Keep a child-safe scope: no public chat, no adverts, no sharing of personal information, and no API keys in client code.

## Immediate next task

Extend the existing Maths fractions module into a stronger **diagnose → teach → practise → test → revisit** loop:

- Add a short diagnostic that separately tests equivalent fractions, common denominators and addition.
- Tag outcomes with skill IDs and likely misconceptions, including false positives that require another check.
- Use a transparent, unit-tested prerequisite graph to choose a targeted mini-lesson. Avoid jumping straight into six unrelated questions.
- Use feedback that distinguishes a mathematical misconception from a minor arithmetic slip.
- Persist progress for each specific sub-skill. Retain separate learner profiles.
- Add a clear parent summary showing which component skills were difficult and the recommended next exercise.
- Keep Maths validation deterministic and support equivalent valid answers. Improve the mastery logic only with tests.
- Add browser-level tests for progression, hints and profile isolation. Preserve accessible, responsive design.

## Delivery

Create a feature branch and PR; no deployment, no unnecessary backend and no automatic merge. Explain major design choices, all tests run and any limitations. Ask before introducing paid third-party AI, hosted databases or public access. Work in small changes with tests and stable interfaces.
