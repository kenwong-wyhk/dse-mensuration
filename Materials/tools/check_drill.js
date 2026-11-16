// Checks the MC drill (site/js/drill.js). Run: node tools/check_drill.js
// 1. Every form, fed the real paper's own numbers, gives the paper's answer (keys from ../Paper 1 and ../Paper 2).
// 2. Every form, generated 2000 times, gives four distinct options and no NaN / undefined.
global.window = {}; global.document = undefined;
require("../site/js/drill.js");
var D = window.Drill;

// strip units and spacing so "1\,260\pi\text{ cm}^3" compares as "1260\pi", and "\text{I only}" as "Ionly"
function norm(s) { return s.replace(/\\text\{ c?m\}\^?\d?/g, "").replace(/\^\\circ/g, "").replace(/\\text\{([^}]*)\}/g, "$1").replace(/\\,|\s/g, ""); }

var papers = [            // [form, the paper's numbers, the paper's answer]
  ["a_angle",   { th: 72, r: 20 }, "72"],                                   // 2024 P2 Q15: D 72 degrees
  ["a_perim",   { m: 3, r: 14 }, "21"],                                     // 2026 P2 Q16: B 21 cm
  ["a_radius",  { th: 75, r: 12 }, "(5\\pi+24)"],                           // 2015 P1 Q9(b)
  ["a_conc",    { a: 30, p: 12, q: 16 }, "10"],                             // 2012 P2 Q16: B 10 cm
  ["a_pct",     { mode: "arc", p: 60 }, "150"],                             // 2020 P2 Q15: D 150
  ["a_true",    { a: 33, c: 39, th: 60, t: [1, 0, 0] }, "Ionly"],           // 2016 P2 Q19: A I only
  ["b_exact",   { th: 60, r: 6, major: false }, "\\left(6\\pi-9\\sqrt{3}\\right)"],   // the minor segment in 2012 P2 Q21
  ["b_num",     { h: 4, d: 3, major: true }, "67"],                         // 2022 P2 Q16: D 67
  ["c_cone",    { h: 12, a: 9, n: 1, d: 3 }, "312\\pi"],                    // 2015 P2 Q16: B 312pi
  ["c_rect",    { L: 18, B: 16, h: 12, b: 12 }, "666"],                     // 2026 P2 Q17: B 666
  ["c_pyr",     { s: 18, h: 12 }, "864"],                                   // 2019 P2 Q15: D 864
  ["c_conehemi", { r: 3, h: 4 }, "33\\pi"],                                 // 2013 P2 Q17: B 33pi
  ["c_prism",   { a: 8, c: 17, L: 12 }, "720"],                             // 2018 P2 Q15: D 720
  ["d_letters", { p: 5, q: 7, s: 7, t: 5, B: 3 }, "245"],                   // 2020 P2 Q16: B 245
  ["d_multi",   { m: 2, n: 3, V: 36 }, "81\\pi"],                           // 2017 P2 Q15: C 81pi
  ["d_hemi",    { a: 2, b: 3, k: 3 }, "342\\pi"],                           // 2021 P2 Q16: A 342pi
  ["d_ratio",   { n: 2, vol: false }, "1:2"],                               // 2022 P2 Q15: A 1 : 2
  ["d_cube",    { s: 60, f: 6 }, "20"],                                     // 2023 P2 Q15: A 20
  ["d_cone_r",  { R: 25, p: 32, q: 15, u: 10, w: 9 }, "60"],                // 2024 P2 Q16: D 60
  ["d_quad",    { r: 6, h: 35 }, "288\\pi"],                                // 2025 P2 Q16: B 288pi
  ["e_par",     { a: 1, b: 1, c: 1 }, "3:5"],                               // 2020 P2 Q17: C 3 : 5
  ["e_pgram",   { m: 5, n: 3, X: 120 }, "237"],                             // 2018 P2 Q16: A 237
  ["e_tri",     { a: 5, b: 6, c: 3, d: 4, X: 59 }, "18"],                   // 2022 P2 Q17: B 18
  ["e_pqrs",    { m: 4, n: 5, T: 90 }, "50"],                               // 2023 P2 Q17: B 50
  ["e_map",     { n: 500, a: 36 }, "1:500"],                                // 2013 P2 Q12: C 1 : 500
  ["a_circ",    { r: 2, t: [1, 0, 1] }, "IandIIIonly"],                     // 2021 P2 Q17: B I and III only
  ["a_chord",   { o: 18, e: 24, arc: false }, "75\\pi"],                    // 2018 P2 Q17: B 75pi
  ["a_pi",      { a: 3, b: 12, t: [1, 1, 1] }, "I,IIandIII"],               // 2025 P2 Q15: D I, II and III
  ["b_comp",    { th: 60, r: 6 }, "\\left(12\\pi+9\\sqrt{3}\\right)"],      // 2012 P2 Q21: D (12pi + 9 sqrt3)
  ["b_semi",    { d: 3, c: 2 }, "0.52"],                                    // 2013 P2 Q16: B 0.52
  ["b_two",     { g1: 30, g2: 10 }, "540"],                                 // 2023 P2 Q16: D 540
  ["c_hex",     { s: 8, k: 1 }, "416"],                                     // 2021 P2 Q15: C 416
  ["c_trap",    { a: 4, h: 5, c: 13, L: 6 }, "300"],                        // 2016 P2 Q18: C 300
  ["e_pgG",     { p: 3, q: 4, r: 1, s: 1, X: 3 }, "14"],                    // 2012 P2 Q17: B 14
  ["e_trapF",   { p: 2, q: 3, s: 1, t: 1, X: 36 }, "280"],                  // 2013 P2 Q18: C 280
  ["e_pgFG",    { p: 2, q: 3, X: 8 }, "27"],                                // 2015 P2 Q17: D 27
  ["e_pgDH",    { p: 2, q: 3, X: 135 }, "144"],                             // 2017 P2 Q16: D 144
  ["e_sqXY",    { a: 2, b: 7, c: 3, Ar: 24 }, "87"],                        // 2019 P2 Q16: D 87
  ["e_pgH",     { a: 2, b: 5, X: 48 }, "343"],                              // 2020 P2 Q18: B 343
  ["e_four",    { a: 1, b: 3, c: 2, d: 3, e: 1, f: 2, X: 16 }, "49"],       // 2025 P2 Q17: B 49
  ["e_tz",      { p: 3, q: 5, s: 2, t: 3, X: 225 }, "279"]                  // 2026 P2 Q18: C 279
];
var ids = Object.keys(D.forms), tested = {};
papers.forEach(function (c) {
  var o = D.forms[c[0]].make(c[1]);
  if (!o) throw new Error(c[0] + ": the paper's numbers were rejected");
  if (norm(o.opts[0]) !== c[2]) throw new Error(c[0] + ": gave " + o.opts[0] + ", the paper's answer is " + c[2]);
  if (new Set(o.opts).size !== 4) throw new Error(c[0] + ": options not distinct with the paper's numbers: " + o.opts);
  tested[c[0]] = true;
});
ids.forEach(function (id) { if (!tested[id]) throw new Error(id + ": no real-paper case"); });
console.log("paper keys ok:", papers.length, "forms checked against the real paper (b_exact: the segment inside 2012 P2 Q21)");

var n = 0;
ids.forEach(function (id) {
  var seen = new Set();
  for (var i = 0; i < 2000; i++) {
    var q = D.gen(id);
    if (q.opts.length !== 4 || new Set(q.opts).size !== 4) throw new Error(id + " options not distinct: " + q.opts);
    if (!q.q || !q.sol || !q.trap) throw new Error(id + " missing text");
    if (/NaN|undefined|Infinity/.test(q.q + q.sol + q.trap + q.opts.join())) throw new Error(id + " bad value: " + q.q);
    seen.add(q.q); n++;
  }
  console.log("  " + id.padEnd(11) + D.forms[id].src + "  " + seen.size + " different questions in 2000");
});
console.log("drill ok:", n, "questions generated and checked");
