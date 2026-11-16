# Mensuration: F6 DSE revision materials

Built 16 Nov, 2026 from the DSE past questions in `../Paper 1` and `../Paper 2` (2012 to 2026).
Class: F6, all aiming for Level 5 or above, so the 2020, 2023 and 2024 "twists" are core, not extension.

## Files

| File | For | Notes |
|---|---|---|
| `print/revision-notes.pdf` | every student | 3 pages: recent-paper map, the formula kit and the one rule (k, k², k³), the five MC shapes, the five ways into Paper 1, the method for claims / "similar?" / "overflow?", the Level 5 twists, traps |
| `print/worksheet.pdf` | every student | 2 pages, print double-sided. A1–A8 (Paper 2 twins), B1–B6 (Paper 1 twins) |
| `print/worksheet-answers.pdf` | teacher | full solutions with M/A marks in the DSE marking-scheme style; release after the homework |
| `site/live.html` | the classroom TV | the 40-minute lesson, 25 scenes. Scroll (or a clicker / arrow keys) to move on; F for full screen |
| `site/index.html` | students, self-study | the notes as a web page, plus an endless randomised MC drill: 41 question types, each a twin of a 2012–2026 DSE question, in the five shapes |

Source files: `print/*.tex` (compile with `pdflatex`; `worksheet-answers.tex` reuses `worksheet.tex`), `site/js/drill.js` (the drill).
Checks: `python tools/check_twins.py` (every twin, the exit ticket and the real-paper answers quoted in the notes, with
exact fractions) and `node tools/check_drill.js` (each of the 41 drill forms, given the real paper's numbers, must give
that paper's answer, or for one form the segment inside 2012 P2 Q21; then 2000 questions per form with four distinct options).

Every worksheet question is a *twin* of a real DSE question (same shape, new numbers).

| Twin | Copies | | Twin | Copies |
|---|---|---|---|---|
| A1 | 2026 P2 Q16 | | B1 | 2016 P1 Q11 |
| A2 | 2016 P2 Q19 | | B2 | 2026 P1 Q13 |
| A3 | 2022 P2 Q16 | | B3 | 2023 P1 Q14 |
| A4 | 2019 P2 Q15 | | B4 | 2024 P1 Q13 |
| A5 | 2026 P2 Q17 | | B5 | 2018 P1 Q14 |
| A6 | 2020 P2 Q16 | | B6 | 2025 P1 Q14 |
| A7 | 2021 P2 Q16 | | Exit ticket | similar cones, CSA 9 : 16 (live scene 24) |
| A8 | 2018 P2 Q16 | | | |

MC answers: A1 B, A2 C, A3 D, A4 B, A5 D, A6 B, A7 A, A8 C. Exit ticket C (128π).
Several twins reverse the original's verdict (B2 agreed, B5 overflows, B6 the cube's area is larger), so students
cannot answer from memory.

## Run sheet (40 minutes)

| Time | Live scenes | What happens |
|---|---|---|
| 0–3 | 1–3 | Hook: in every DSE from 2012 to 2026; 114 Paper 1 marks over 15 papers, plus about three MCs a year. Today's plan |
| 3–7 | 4–6 | The one rule (similar cones grow, k, k², k³); class commits on 2017's 4 : 9, then 8 : 27 |
| 7–10 | 7–9 | The five MC shapes; class commits on 2026 P2 Q16 (sector), then area = ½rℓ |
| 10–16 | 10–11 | Worksheet A1–A4 alone (5:00 timer), then the answers |
| 16–19 | 12–13 | "Which way in?" on four real Paper 1 stems, then the four first lines |
| 19–23 | 14–17 | Frustums: 2020's three equal heights (commit, then 7/27); 2023's "15 times" (commit, then 1 : 4) |
| 23–26 | 18–19 | 2018 overflow: the sphere is lowered, class commits Yes / No, then the three-line method with its marks |
| 26–35 | 20–21 | **Worksheet B2 under exam conditions** (7:00), swap and peer-mark (2:00) with the scheme |
| 35–37 | 22–23 | The similarity test written the DSE way (2024); six traps |
| 37–40 | 24–25 | Exit ticket MC (1:30), answer, homework |

If time runs short, cut scenes 12–13 (the ways in are in the notes) before cutting the B2 exam-conditions block.

## Opening the pages

Double-click `site/live.html` in Chrome or Edge. Everything (maths fonts, KaTeX, Oswald, Noto Sans HK) is in the
folder, so no internet connection is needed. If the maths appears as raw `\frac` text, run a local server from
this folder instead and open `http://localhost:8812/site/live.html`:

```bash
python -m http.server 8812 --directory "Mensuration/Materials"
```

(run from `DSE Notes Dev`; `.claude/launch.json` has the same command as "mensuration").

## Public repository

The live page follows the public Polynomials pack: no College signature and no licensed Garamond fonts. The foot
shows "F6 Mathematics · Mensuration" in muted text instead. Fonts (Oswald, Noto Sans HK, KaTeX) are self-hosted under
their open licences in `site/vendor/`. `../Lesson WS/` (the College's own worksheet PDFs) is left out of the
repository by `.gitignore`.
