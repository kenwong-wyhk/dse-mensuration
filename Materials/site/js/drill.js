/* Paper 2 MC drill: endless randomised twins of the DSE Mensuration MCs, grouped in the five shapes (A to E).
   Each form copies one real past-paper question. pick() chooses random numbers; make(p) builds the question from
   them, or returns null when the numbers do not work. make() with the paper's own numbers gives the paper's answer
   (tools/check_drill.js tests that for every form). The correct option is always opts[0]; the page shuffles them. */
(function () {
  "use strict";
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function distinct(list) {
    for (var i = 0; i < list.length; i++) for (var j = i + 1; j < list.length; j++) if (list[i] === list[j]) return false;
    return true;
  }
  function isInt(v) { return Math.abs(v - Math.round(v)) < 1e-9; }
  function isqrt(v) { var s = Math.round(Math.sqrt(v)); return s * s === v ? s : null; }     // whole square root, or null
  function safe(x) { return Math.abs(x - Math.floor(x) - 0.5) > 0.05; }                      // not too close to a rounding boundary
  function N(v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, "\\,"); }                // 1260 -> 1\,260, as printed in the DSE
  function pi(c) { return c === 1 ? "\\pi" : N(c) + "\\pi"; }
  function fr(n, d) { var g = gcd(n, d); n /= g; d /= g; return d === 1 ? N(n) : "\\tfrac{" + n + "}{" + d + "}"; }
  function ratio(a, b) { var g = gcd(a, b); return N(a / g) + " : " + N(b / g); }
  function T(s) { return "\\text{" + s + "}"; }
  function shuffled(arr) { return arr.slice().sort(function () { return Math.random() - 0.5; }); }
  var CM = "\\text{ cm}", CM2 = "\\text{ cm}^2", CM3 = "\\text{ cm}^3";
  var ANGLES = [30, 36, 40, 45, 60, 72, 80, 90, 108, 120, 135, 144, 150];
  function triple() {                                               // a Pythagorean triple [leg, leg, hypotenuse], legs in random order
    var t = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]), k = ri(1, 3);
    t = t.map(function (v) { return v * k; });
    return Math.random() < 0.5 ? t : [t[1], t[0], t[2]];
  }

  /* ---------- Small figures (SVG strings; not drawn to scale, as in the DSE) ---------- */
  var S = 'stroke="#231f20" stroke-width="2" fill="none"', WASH = 'fill="rgba(0,72,152,0.15)"';
  function lab(x, y, t) { return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="16" font-style="italic" text-anchor="middle">' + t + "</text>"; }
  function fig(w, h, body) { return '<svg class="dfig" viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="Figure">' + body + "</svg>"; }
  function xy(p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }
  function along(P, Q, t) { return [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]; }
  function dseg(X, A, B) {                                          // distance from point X to segment AB
    var dx = B[0] - A[0], dy = B[1] - A[1], t = Math.max(0, Math.min(1, ((X[0] - A[0]) * dx + (X[1] - A[1]) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(X[0] - A[0] - t * dx, X[1] - A[1] - t * dy);
  }
  /* Label a point P so the letter never sits on a line: try the middle of each gap between the lines through P
     (ends = their far ends) and 16 compass directions, 16 px and 21 px out, and keep the spot furthest from every
     line of the figure (segs) and from letters already placed (box.taken), inside the box; the nearer spot wins
     unless the further one is clearly clearer. */
  function labX(P, ends, segs, t, box) {
    box = box || { W: 360, H: 175, taken: [] };
    var dirs = ends.map(function (E) { return Math.atan2(E[1] - P[1], E[0] - P[0]); }).sort(function (u, v) { return u - v; }), tries = [], best = null, room = -Infinity;
    dirs.forEach(function (u, i) { tries.push((u + (i + 1 < dirs.length ? dirs[i + 1] : dirs[0] + 2 * Math.PI)) / 2); });
    for (var k = 0; k < 16; k++) tries.push(k * Math.PI / 8);
    [16, 21].forEach(function (d, j) {
      tries.forEach(function (m) {
        var C = [P[0] + d * Math.cos(m), P[1] + d * Math.sin(m)];
        if (C[0] < 7 || C[0] > box.W - 7 || C[1] < 8 || C[1] > box.H - 5) return;
        var r = Math.min.apply(null, segs.map(function (s) { return dseg(C, s[0], s[1]); }).concat(box.taken.map(function (L) { return Math.hypot(C[0] - L[0], C[1] - L[1]) - 6; }))) - 2 * j;
        if (r > room + 0.01) { room = r; best = C; }
      });
    });
    best = best || [P[0], P[1] - 12];
    box.taken.push(best);
    return lab(best[0], best[1] + 5.5, t);
  }
  function seg(P, Q) { return '<line x1="' + P[0].toFixed(1) + '" y1="' + P[1].toFixed(1) + '" x2="' + Q[0].toFixed(1) + '" y2="' + Q[1].toFixed(1) + '" ' + S + "/>"; }
  function cross(P, Q, R, U) {                                      // where line PQ meets line RU
    var d = (Q[0] - P[0]) * (U[1] - R[1]) - (Q[1] - P[1]) * (U[0] - R[0]);
    var t = ((R[0] - P[0]) * (U[1] - R[1]) - (R[1] - P[1]) * (U[0] - R[0])) / d;
    return [P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])];
  }
  /* A figure from points in units (y up) and the segments joining them (pairs of names). It is fitted into the box,
     and every point is labelled with labX, so each letter sits in the clearest gap between the lines through it. */
  function drawFig(pts, segs) {
    var W = 360, H = 190, names = Object.keys(pts), xs = names.map(function (k) { return pts[k][0]; }), ys = names.map(function (k) { return pts[k][1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var s = Math.min((W - 60) / (x1 - x0), (H - 50) / (y1 - y0)), ox = (W - (x1 - x0) * s) / 2, oy = (H - (y1 - y0) * s) / 2, P = {};
    names.forEach(function (k) { P[k] = [ox + (pts[k][0] - x0) * s, H - oy - (pts[k][1] - y0) * s]; });
    var lines = segs.map(function (g) { return [P[g[0]], P[g[1]]]; }), body = lines.map(function (l) { return seg(l[0], l[1]); }).join(""), box = { W: W, H: H, taken: [] };
    names.forEach(function (k) {
      var ends = [];
      lines.forEach(function (l) {
        if (l[0] === P[k]) ends.push(l[1]); else if (l[1] === P[k]) ends.push(l[0]);
        else if (dseg(P[k], l[0], l[1]) < 0.5) ends.push(l[0], l[1]);   // the point lies on this line
      });
      body += labX(P[k], ends, lines, k, box);
    });
    return fig(W, H, body);
  }
  function yes(b) { return b ? "true" : "false"; }
  var COMBO = { "1": "I only", "2": "II only", "3": "III only", "12": "I and II only", "13": "I and III only", "23": "II and III only", "123": "I, II and III" };
  function combo(t) {                                               // the four options of a "which is/are true?" MC, correct one first
    var key = (t[0] ? "1" : "") + (t[1] ? "2" : "") + (t[2] ? "3" : "");
    return [key].concat(shuffled(Object.keys(COMBO).filter(function (k) { return k !== key; })).slice(0, 3)).map(function (k) { return T(COMBO[k]); });
  }
  function surd(n) {                                                // sqrt(300) -> 10\sqrt{3}
    var k = 1;
    for (var i = 2; i * i <= n; i++) while (n % (i * i) === 0) { n /= i * i; k *= i; }
    return n === 1 ? String(k) : (k === 1 ? "" : k) + "\\sqrt{" + n + "}";
  }
  function figSectors(shade) {                                      // sectors OAB and OCD with centre O, A on OC and B on OD
    var O = [30, 100], a = 16 * Math.PI / 180, R1 = 190, R2 = 300;
    function at(r, s) { return [O[0] + r * Math.cos(a), O[1] - s * r * Math.sin(a)]; }
    var A = at(R1, 1), B = at(R1, -1), C = at(R2, 1), D = at(R2, -1);
    var body = (shade ? '<path d="M' + xy(A) + " A" + R1 + " " + R1 + " 0 0 1 " + xy(B) + " L" + xy(D) + " A" + R2 + " " + R2 + " 0 0 0 " + xy(C) + ' Z" ' + WASH + "/>" : "") +
      '<path d="M' + xy(C) + " L" + xy(O) + " L" + xy(D) + " A" + R2 + " " + R2 + " 0 0 0 " + xy(C) + '" ' + S + "/>" +
      '<path d="M' + xy(A) + " A" + R1 + " " + R1 + " 0 0 1 " + xy(B) + '" ' + S + "/>";
    return fig(360, 200, body + lab(18, 106, "O") + lab(A[0] - 4, A[1] - 8, "A") + lab(B[0] - 4, B[1] + 20, "B") + lab(C[0] + 12, C[1] + 10, "C") + lab(D[0] + 12, D[1] + 4, "D"));
  }

  /* ---------- The forms ---------- */
  var forms = {

    /* ===== A: sector ===== */
    a_angle: { shape: "A", src: "2024 P2 Q15",
      pick: function () { return { th: pick(ANGLES), r: ri(5, 30) }; },
      make: function (p) {
        if ((p.th * p.r) % 180 || (p.th * p.r * p.r) % 360) return null;
        var l = p.th * p.r / 180, A = p.th * p.r * p.r / 360;
        var others = shuffled(ANGLES.filter(function (a) { return a !== p.th; })).slice(0, 3);
        return {
          q: "If the arc length and the area of a sector are \\(" + pi(l) + CM + "\\) and \\(" + pi(A) + CM2 + "\\) respectively, then the angle of the sector is",
          opts: [p.th].concat(others).map(function (a) { return a + "^\\circ"; }),
          sol: "Area \\(= \\tfrac12 r\\ell\\): \\(" + pi(A) + " = \\tfrac12 r(" + pi(l) + ")\\), so \\(r = " + p.r + "\\).<br>" +
               "Arc: \\(2\\pi(" + p.r + ")\\times\\dfrac{\\theta}{360^\\circ} = " + pi(l) + "\\), so \\(\\theta = " + p.th + "^\\circ\\).",
          trap: "Find the radius first with area \\(= \\tfrac12 r\\ell\\); it saves solving two equations."
        };
      } },

    a_perim: { shape: "A", src: "2026 P2 Q16",
      pick: function () { return { m: ri(1, 6), r: ri(6, 60) }; },
      make: function (p) {
        var m = p.m, r = p.r;
        if (r <= 2 * m || (4 * m * r) % (r - 2 * m)) return null;
        var l = 4 * m * r / (r - 2 * m), k = 2 * r + l;
        if (l >= 2 * Math.PI * r) return null;
        var mk = (m === 1 ? "" : m) + "k";
        return {
          q: "The perimeter and the area of a sector are \\(k" + CM + "\\) and \\(" + mk + CM2 + "\\) respectively. If the radius of the sector is \\(" + r + CM + "\\), then the arc length of the sector is",
          opts: [l, k, 2 * l, r].map(function (v) { return N(v) + CM; }),
          sol: "Let the arc be \\(\\ell\\). Area \\(= \\tfrac12(" + r + ")\\ell = " + mk + "\\), so \\(k = " + fr(r, 2 * m) + "\\ell\\).<br>" +
               "Perimeter \\(= " + 2 * r + " + \\ell = k\\). Solving, \\(\\ell = " + l + "\\).",
          trap: "\\(" + k + "\\) is \\(k\\), the perimeter. The perimeter is the arc plus two radii."
        };
      } },

    a_radius: { shape: "A", src: "2015 P1 Q9",
      pick: function () { return { th: pick(ANGLES), r: ri(4, 24) }; },
      make: function (p) {
        if ((p.th * p.r) % 180 || (p.th * p.r * p.r) % 360) return null;
        var c = p.th * p.r / 180, A = p.th * p.r * p.r / 360, r = p.r;
        return {
          q: "The radius and the area of a sector are \\(" + r + CM + "\\) and \\(" + pi(A) + CM2 + "\\) respectively. The perimeter of the sector is",
          opts: [pi(c) + " + " + 2 * r, pi(c), pi(c) + " + " + r, pi(2 * c) + " + " + 2 * r].map(function (t) { return "(" + t + ")" + CM; }),
          sol: "\\(\\dfrac{\\theta}{360^\\circ}\\pi(" + r + "^2) = " + pi(A) + "\\), so \\(\\theta = " + p.th + "^\\circ\\). Arc \\(= \\dfrac{" + p.th + "}{360}(2\\pi)(" + r + ") = " + pi(c) + "\\).<br>" +
               "Perimeter \\(= " + pi(c) + " + 2(" + r + ") = (" + pi(c) + " + " + 2 * r + ")" + CM + "\\).",
          trap: "The perimeter of a sector is the arc plus <strong>two</strong> radii."
        };
      } },

    a_conc: { shape: "A", src: "2012 P2 Q16",
      pick: function () { return { a: 5 * ri(2, 12), p: ri(2, 20), q: ri(3, 30) }; },
      make: function (p) {
        var AC = p.a * (p.q - p.p) / p.p, OC = p.a * p.q / p.p, th = 180 * p.p / p.a;
        if (p.q <= p.p || !isInt(AC) || AC % 2 || th < 20 || th > 150) return null;
        return {
          fig: figSectors(false),
          q: "In the figure, \\(OAB\\) and \\(OCD\\) are sectors with centre \\(O\\). If the arc \\(AB\\) is \\(" + pi(p.p) + CM + "\\), the arc \\(CD\\) is \\(" + pi(p.q) + CM + "\\) and \\(OA = " + p.a + CM + "\\), then \\(AC =\\)",
          opts: [AC, AC / 2, 2 * AC, OC].map(function (v) { return N(v) + CM; }),
          sol: "The two sectors have the same angle, so the arcs are in the ratio of the radii: \\(\\dfrac{OC}{OA} = \\dfrac{" + pi(p.q) + "}{" + pi(p.p) + "}\\).<br>" +
               "So \\(OC = " + p.a + "\\times" + fr(p.q, p.p) + " = " + OC + "\\) and \\(AC = " + OC + " - " + p.a + " = " + AC + CM + "\\).",
          trap: "\\(" + OC + "\\) is \\(OC\\). \\(AC\\) is what is left after taking away \\(OA\\)."
        };
      } },

    a_pct: { shape: "A", src: "2020 P2 Q15",
      pick: function () { var mode = pick(["arc", "area"]); return { mode: mode, p: mode === "arc" ? pick([20, 50, 60, 75, 80]) : pick([36, 75, 84, 96]) }; },
      make: function (P) {
        var p = P.p, keep = (100 - p) / 100, arc = P.mode === "arc";
        var k = arc ? 100 * p / (100 - p) : 100 * (1 / Math.sqrt(keep) - 1);
        if (!isInt(k)) return null;
        k = Math.round(k);
        var opts = arc ? [k, p, 100 - p, Math.round(100 * p / (100 + p))] : [k, Math.round(100 * p / (100 - p)), Math.round(k / 2), p];
        return {
          q: "The angle of a sector is decreased by \\(" + p + "\\%\\) but its radius is increased by \\(k\\%\\). If the " + (arc ? "arc length" : "area") + " of the sector remains unchanged, find the value of \\(k\\).",
          opts: opts.map(String),
          sol: (arc ? "Arc length \\(\\propto \\theta r\\): \\((1 - " + p + "\\%)(1 + k\\%) = 1\\), so \\(1 + k\\% = \\dfrac{1}{" + keep + "} = " + (1 + k / 100) + "\\)"
                    : "Area \\(\\propto \\theta r^2\\): \\((1 - " + p + "\\%)(1 + k\\%)^2 = 1\\), so \\((1 + k\\%)^2 = \\dfrac{1}{" + keep + "}\\) and \\(1 + k\\% = " + (1 + k / 100) + "\\)") +
               ", so \\(k = " + k + "\\).",
          trap: arc ? "Percentage changes multiply; they do not cancel by adding the same percentage back."
                    : "The area goes with \\(r^2\\), so the radius factor is squared before you solve."
        };
      } },

    a_true: { shape: "A", src: "2016 P2 Q19",
      pick: function () { var a = 6 * ri(1, 5); return { a: a, c: a + 6 * ri(1, 3), th: pick(ANGLES), t: [ri(0, 1), ri(0, 1), ri(0, 1)] }; },
      make: function (p) {
        var a = p.a, c = p.c, th = p.th, t = p.t;
        var shade = (c * c - a * a) * th / 360, arc = c * th / 180, inner = a * a * th / 360, outer = c * c * th / 360;
        if (!t[0] && !t[1] && !t[2]) return null;
        if (!isInt(shade) || !isInt(arc) || (t[1] && !isInt(inner))) return null;
        var wrongTh = th + 15 <= 165 ? th + 15 : th - 15, falseII = isInt(outer) ? outer : shade;
        return {
          fig: figSectors(true),
          q: "In the figure, \\(OAB\\) and \\(OCD\\) are sectors with centre \\(O\\), where \\(OA = " + a + CM + "\\) and \\(OC = " + c + CM + "\\). The area of the shaded region \\(ABDC\\) is \\(" + pi(shade) + CM2 + "\\). Which of the following is/are true?" +
             "<br>I. The angle of the sector \\(OAB\\) is \\(" + (t[0] ? th : wrongTh) + "^\\circ\\)." +
             "<br>II. The area of the sector \\(OAB\\) is \\(" + pi(t[1] ? inner : falseII) + CM2 + "\\)." +
             "<br>III. The perimeter of the sector \\(OCD\\) is \\(" + (t[2] ? "(" + pi(arc) + " + " + 2 * c + ")" : pi(arc)) + CM + "\\).",
          opts: combo(t),
          sol: "\\(\\dfrac{\\theta}{360^\\circ}\\pi(" + c + "^2 - " + a + "^2) = " + pi(shade) + "\\), so \\(\\theta = " + th + "^\\circ\\). I is " + yes(t[0]) + ".<br>" +
               "Sector \\(OAB = \\dfrac{" + th + "}{360}\\pi(" + a + "^2) = " + fr(a * a * th, 360) + "\\pi\\). II is " + yes(t[1]) + ".<br>" +
               "Perimeter of \\(OCD = 2(" + c + ") + \\dfrac{" + th + "}{360}(2\\pi)(" + c + ") = " + 2 * c + " + " + pi(arc) + "\\). III is " + yes(t[2]) + ".",
          trap: "Test each statement on its own. The perimeter of a sector includes both radii; sector \\(OAB\\) is not the shaded region."
        };
      } },

    a_circ: { shape: "A", src: "2021 P2 Q17",
      pick: function () { return { r: 2 * ri(1, 8), t: [ri(0, 1), ri(0, 1), ri(0, 1)] }; },
      make: function (p) {
        var r = p.r, t = p.t, A = r * r / 4, arc = r / 2;
        if (!t[0] && !t[1] && !t[2]) return null;
        return {
          q: "The area of the sector \\(OAB\\) is \\(" + pi(A) + CM2 + "\\), where \\(O\\) is the centre of the sector \\(OAB\\). If \\(\\angle AOB = 90^\\circ\\), which of the following is/are true?" +
             "<br>I. The radius of the sector \\(OAB\\) is \\(" + (t[0] ? r : 2 * r) + CM + "\\)." +
             "<br>II. The perimeter of the sector \\(OAB\\) is \\(" + (t[1] ? "(" + pi(arc) + " + " + 2 * r + ")" : pi(arc)) + CM + "\\)." +
             "<br>III. The area of the circle passing through \\(O\\), \\(A\\) and \\(B\\) is \\(" + pi(t[2] ? r * r / 2 : r * r) + CM2 + "\\).",
          opts: combo(t),
          sol: "\\(\\dfrac{90}{360}\\pi r^2 = " + pi(A) + "\\), so \\(r = " + r + "\\). I is " + yes(t[0]) + ".<br>" +
               "Perimeter \\(= 2(" + r + ") + \\tfrac14(2\\pi)(" + r + ") = " + 2 * r + " + " + pi(arc) + "\\). II is " + yes(t[1]) + ".<br>" +
               "\\(\\angle AOB = 90^\\circ\\), so \\(AB\\) is a diameter of the circle through \\(O\\), \\(A\\) and \\(B\\) (angle in a semicircle). " +
               "\\(AB = " + r + "\\sqrt{2}\\), so its area is \\(\\pi\\left(\\tfrac{" + r + "\\sqrt{2}}{2}\\right)^2 = " + pi(r * r / 2) + "\\). III is " + yes(t[2]) + ".",
          trap: "The circle through \\(O\\), \\(A\\) and \\(B\\) has \\(AB\\) as a diameter; \\(OA\\) is not its radius."
        };
      } },

    a_chord: { shape: "A", src: "2018 P2 Q17",
      pick: function () { var t = pick([[3, 4], [4, 3], [5, 12]]), k = pick([6, 12]); return { o: t[0] * k, e: t[1] * k, arc: Math.random() < 0.5 }; },
      make: function (p) {
        var o = p.o, e = p.e, R = isqrt(o * o + e * e);
        if (!R || R % 6 || e % 6 || 2 * e <= R || R > 80) return null;
        var AF = e - R / 2, DF = e + R / 2, EF = R / 2;
        var opts = p.arc ? [R / 6, R / 3, e / 6, e / 3].map(function (v) { return pi(v) + CM; })
                         : [R * R / 12, R * R / 6, e * e / 12, e * e / 6].map(function (v) { return pi(v) + CM2; });
        var s = 150 / R, O = [180, 182], A = [O[0] - e * s, O[1] - o * s], D = [O[0] + e * s, O[1] - o * s], C = [O[0], O[1] - R * s],
            B = [O[0] - R * s / 2, O[1] - R * s * Math.sqrt(3) / 2], E = [O[0], A[1]], F = [B[0], A[1]], Rs = R * s,
            dash = 'stroke="#231f20" stroke-width="1.5" stroke-dasharray="5 4"';
        var svg = '<path d="M' + xy(O) + " L" + xy(A) + " A" + Rs + " " + Rs + " 0 0 1 " + xy(D) + ' Z" ' + S + "/>" + seg(A, D) +
                  '<path d="M' + xy(O) + " L" + xy(C) + " M" + xy(O) + " L" + xy(B) + " L" + xy(F) + '" fill="none" ' + dash + "/>";
        return {
          fig: fig(360, 205, svg + lab(O[0], O[1] + 18, "O") + lab(A[0] - 12, A[1] + 4, "A") + lab(B[0] - 10, B[1] - 6, "B") + lab(C[0], C[1] - 7, "C") +
                             lab(D[0] + 12, D[1] + 4, "D") + (function () {   // E and F sit among lines, so place them clear of all of them
                               var lines = [[O, A], [O, D], [A, D], [O, C], [O, B], [B, F]], box = { W: 360, H: 205, taken: [[O[0], O[1] + 12.5], [B[0] - 10, B[1] - 11.5]] };
                               return labX(E, [A, D, O, C], lines, "E", box) + labX(F, [A, D, B], lines, "F", box);
                             })()),
          q: "In the figure, \\(O\\) is the centre of the sector \\(OABCD\\). \\(AD\\) and \\(OC\\) are perpendicular to each other and intersect at the point \\(E\\). \\(F\\) is a point lying on \\(AD\\) such that \\(BF\\) is perpendicular to \\(AD\\). If \\(AF = " + AF + CM + "\\), \\(DF = " + DF + CM + "\\) and \\(OE = " + o + CM + "\\), then the " + (p.arc ? "length of the arc \\(BC\\)" : "area of the sector \\(OBC\\)") + " is",
          opts: opts,
          sol: "\\(OC \\perp AD\\), so \\(E\\) is the mid-point of \\(AD\\): \\(AE = \\tfrac12(" + AF + " + " + DF + ") = " + e + "\\) and \\(EF = " + e + " - " + AF + " = " + EF + "\\).<br>" +
               "Radius \\(OA = \\sqrt{" + o + "^2 + " + e + "^2} = " + R + "\\). \\(B\\) is \\(EF = " + EF + "\\) from \\(OC\\), so \\(\\sin\\angle BOC = \\tfrac{" + EF + "}{" + R + "} = \\tfrac12\\) and \\(\\angle BOC = 30^\\circ\\).<br>" +
               (p.arc ? "Arc \\(BC = \\dfrac{30}{360}(2\\pi)(" + R + ") = " + pi(R / 6) + CM + "\\)." : "Sector \\(OBC = \\dfrac{30}{360}\\pi(" + R + "^2) = " + pi(R * R / 12) + CM2 + "\\)."),
          trap: "The radius is \\(OA\\), found by Pythagoras in \\(\\triangle OEA\\); \\(AE\\) is not the radius."
        };
      } },

    a_pi: { shape: "A", src: "2025 P2 Q15",
      pick: function () { var a = ri(1, 6); return { a: a, b: 2 * a + ri(1, 5 * a), t: [ri(0, 1), ri(0, 1), ri(0, 1)] }; },
      make: function (p) {
        var a = p.a, b = p.b, t = p.t, c = b - 2 * a, th = 180 * c / (a * Math.PI), r = a * Math.PI;
        var P = 2 * r + 2 * r * Math.sin(th * Math.PI / 360), fP = P - Math.floor(P), dTh = th - 10 * Math.floor(th / 10);
        if ((!t[0] && !t[1] && !t[2]) || c <= 0 || th < 40 || th > 300 || fP < 0.1 || fP > 0.9 || dTh < 1 || dTh > 9) return null;
        function sq(s) { return (s === "1" ? "" : s) + "\\pi^2"; }
        var area = fr(a * c, 2), L = t[1] ? Math.ceil(P) : Math.floor(P), Dg = t[2] ? 10 * Math.floor(th / 10) : 10 * Math.ceil(th / 10), ra = pi(a);
        return {
          q: "The perimeter of the sector \\(OMN\\) is \\(" + pi(b) + CM + "\\), where \\(O\\) is the centre of the sector \\(OMN\\). If the radius of the sector \\(OMN\\) is \\(" + ra + CM + "\\), which of the following is/are true?" +
             "<br>I. The area of the sector \\(OMN\\) is \\(" + sq(t[0] ? area : N(a * c)) + CM2 + "\\)." +
             "<br>II. The perimeter of \\(\\triangle OMN\\) is less than \\(" + L + CM + "\\)." +
             "<br>III. The angle of the sector \\(OMN\\) is greater than \\(" + Dg + "^\\circ\\).",
          opts: combo(t),
          sol: "Arc \\(MN = " + pi(b) + " - 2(" + ra + ") = " + pi(c) + "\\). Area \\(= \\tfrac12(" + ra + ")(" + pi(c) + ") = " + sq(area) + "\\). I is " + yes(t[0]) + ".<br>" +
               "\\(\\angle MON = \\dfrac{" + pi(c) + "}{2\\pi(" + ra + ")}\\times 360^\\circ \\approx " + th.toFixed(1) + "^\\circ\\). III is " + yes(t[2]) + ".<br>" +
               "Perimeter of \\(\\triangle OMN = 2(" + ra + ") + 2(" + ra + ")\\sin\\dfrac{\\angle MON}{2} \\approx " + P.toFixed(2) + "\\). II is " + yes(t[1]) + ".",
          trap: "The radius is a multiple of \\(\\pi\\): keep that \\(\\pi\\) when you find the arc, the area and the angle."
        };
      } },

    /* ===== B: segment ===== */
    b_exact: { shape: "B", src: "the segment in 2012 P2 Q21",
      pick: function () { var th = pick([60, 90, 120]); return { th: th, r: th === 90 ? 2 * ri(2, 6) : 6 * ri(1, 2), major: Math.random() < 0.5 }; },
      make: function (p) {
        var th = p.th, r = p.r;
        if (th === 90 ? r % 2 : r % 6) return null;
        var s = th * r * r / 360, t = th === 90 ? r * r / 2 : r * r / 4, u = th === 90 ? "" : "\\sqrt{3}", whole = r * r;
        var chord = th === 60 ? String(r) : th === 90 ? r + "\\sqrt{2}" : r + "\\sqrt{3}";
        function e(a, sign, b) { return "\\left(" + pi(a) + " " + sign + " " + b + u + "\\right)" + CM2; }
        return {
          q: "\\(AB\\) is a chord of a circle with centre \\(O\\) and radius \\(" + r + CM + "\\). If \\(AB = " + chord + CM + "\\), find the area of the " + (p.major ? "major" : "minor") + " segment cut off by \\(AB\\).",
          opts: p.major ? [e(whole - s, "+", t), e(whole - s, "-", t), e(s, "-", t), e(whole - s, "+", 2 * t)]
                        : [e(s, "-", t), e(s, "+", t), e(whole - s, "+", t), e(s, "-", 2 * t)],
          sol: "\\(OA = OB = " + r + "\\) and \\(AB = " + chord + "\\), so \\(\\angle AOB = " + th + "^\\circ\\)" + (th === 60 ? " (an equilateral triangle)" : th === 90 ? " (Pythagoras)" : " (cosine formula)") + ".<br>" +
               "Minor segment \\(= \\dfrac{" + th + "}{360}\\pi(" + r + "^2) - \\tfrac12(" + r + "^2)\\sin " + th + "^\\circ = " + pi(s) + " - " + t + u + "\\)." +
               (p.major ? "<br>Major segment \\(= \\pi(" + r + "^2) - (" + pi(s) + " - " + t + u + ") = " + pi(whole - s) + " + " + t + u + "\\)." : ""),
          trap: "Segment = sector <strong>minus</strong> triangle; the major segment is the circle minus the minor one."
        };
      } },

    b_num: { shape: "B", src: "2022 P2 Q16",
      pick: function () { var t = triple(); return { h: t[0], d: t[1], major: Math.random() < 0.5 }; },
      make: function (p) {
        var h = p.h, d = p.d, r = isqrt(h * h + d * d);
        if (!r) return null;
        var ang = 2 * Math.asin(h / r) * 180 / Math.PI, circle = Math.PI * r * r;
        var minSec = circle * ang / 360, majSec = circle - minSec, minor = minSec - h * d, major = circle - minor;
        var vals = p.major ? [major, minor, majSec, majSec - h * d] : [minor, major, minSec, minSec + h * d];
        if (!vals.every(safe)) return null;
        return {
          q: "The diameter of a circle is \\(" + 2 * r + CM + "\\). The circle is divided into a major segment and a minor segment by a chord of length \\(" + 2 * h + CM + "\\). Find the area of the " + (p.major ? "major" : "minor") + " segment correct to the nearest \\(\\text{cm}^2\\).",
          opts: vals.map(function (v) { return N(Math.round(v)) + CM2; }),
          sol: "Radius \\(" + r + "\\). The distance from the centre to the chord is \\(\\sqrt{" + r + "^2 - " + h + "^2} = " + d + "\\), and the angle at the centre is \\(2\\sin^{-1}\\tfrac{" + h + "}{" + r + "} \\approx " + ang.toFixed(2) + "^\\circ\\).<br>" +
               "Minor segment \\(\\approx " + minSec.toFixed(2) + " - \\tfrac12(" + 2 * h + ")(" + d + ") = " + minor.toFixed(2) + "\\)." +
               (p.major ? " Major segment \\(= \\pi(" + r + "^2) - " + minor.toFixed(2) + " \\approx " + Math.round(major) + "\\)." : ""),
          trap: "Segment = sector \\(\\pm\\) triangle. The major segment is the circle minus the minor segment."
        };
      } },

    b_comp: { shape: "B", src: "2012 P2 Q21",
      pick: function () { var th = pick([60, 90, 120]); return { th: th, r: th === 90 ? 2 * ri(1, 6) : 6 * ri(1, 3) }; },
      make: function (p) {
        var th = p.th, r = p.r, u = th === 90 ? "" : "\\sqrt{3}", sec = th * r * r / 360, s = r * r / 2 - sec, t = th === 90 ? r * r / 2 : r * r / 4;
        if (!isInt(sec) || !isInt(s) || !isInt(t)) return null;
        var chord = th === 60 ? String(r) : th === 90 ? r + "\\sqrt{2}" : r + "\\sqrt{3}";
        function e(a, sign, b, w) { return "\\left(" + pi(a) + " " + sign + " " + b + w + "\\right)" + CM2; }
        var opts = th === 90 ? [e(s, "+", t, ""), e(s, "-", t, ""), e(s, "+", 2 * t, ""), e(2 * s, "-", t, "")]
                             : [e(s, "+", t, u), e(s, "-", t, u), e(s, "+", t, ""), e(s, "-", t, "")];
        var O = [180, 118], R = 88, a1 = (90 + th / 2) * Math.PI / 180, a2 = (90 - th / 2) * Math.PI / 180;
        var A = [O[0] - R, O[1]], B = [O[0] + R, O[1]], D = [O[0] + R * Math.cos(a1), O[1] - R * Math.sin(a1)], C = [O[0] + R * Math.cos(a2), O[1] - R * Math.sin(a2)];
        var svg = '<path d="M' + xy(A) + " L" + xy(B) + " A" + R + " " + R + " 0 0 0 " + xy(C) + " L" + xy(D) + " A" + R + " " + R + " 0 0 0 " + xy(A) + ' Z" ' + WASH + "/>" +
                  '<circle cx="' + O[0] + '" cy="' + O[1] + '" r="' + R + '" ' + S + "/>" + seg(A, B) + seg(C, D);
        return {
          fig: fig(360, 215, svg + lab(A[0] - 12, A[1] + 5, "A") + lab(B[0] + 12, B[1] + 5, "B") + lab(C[0] + 10, C[1] - 5, "C") + lab(D[0] - 10, D[1] - 5, "D")),
          q: "In the figure, \\(AB\\) is a diameter of the circle \\(ABCD\\). If \\(AB = " + 2 * r + CM + "\\) and \\(CD = " + chord + CM + "\\), then the area of the shaded region is",
          opts: opts,
          sol: "Let \\(O\\) be the centre: \\(OC = OD = " + r + "\\) and \\(CD = " + chord + "\\), so \\(\\angle COD = " + th + "^\\circ\\).<br>" +
               "Segment cut off by \\(CD = \\dfrac{" + th + "}{360}\\pi(" + r + "^2) - \\tfrac12(" + r + "^2)\\sin " + th + "^\\circ = " + pi(sec) + " - " + t + u + "\\).<br>" +
               "Shaded \\(=\\) semicircle \\(-\\) segment \\(= " + pi(r * r / 2) + " - (" + pi(sec) + " - " + t + u + ") = " + pi(s) + " + " + t + u + "\\).",
          trap: "Taking the segment away adds the triangle back, so the triangle's term has a <strong>plus</strong> sign."
        };
      } },

    b_semi: { shape: "B", src: "2013 P2 Q16",
      pick: function () { var d = ri(2, 12); return { d: d, c: ri(1, d - 1) }; },
      make: function (p) {
        var d = p.d, c = p.c, R = d / 2, cs = 1 - 2 * c * c / (d * d);
        if (c >= d) return null;
        var th = Math.acos(cs) * 180 / Math.PI, tri = R * R * Math.sin(th * Math.PI / 180) / 2, sec = Math.PI * R * R * th / 360, segA = sec - tri;
        var th2 = Math.acos(1 - c * c / (2 * d * d)) * 180 / Math.PI, seg2 = Math.PI * d * d * th2 / 360 - d * d * Math.sin(th2 * Math.PI / 180) / 2;
        var segB = Math.PI * R * R * (180 - th) / 360 - tri;            // the segment on the other chord BC
        var vals = [segA, seg2, sec, segB];
        if (!safe(segA * 100) || !vals.every(function (v) { return v >= 0.01; })) return null;
        var O = [180, 165], Rs = 140, A = [O[0] - Rs, O[1]], B = [O[0] + Rs, O[1]], C = [O[0] - Rs * cs, O[1] - Rs * Math.sin(th * Math.PI / 180)];
        var svg = '<path d="M' + xy(A) + " A" + Rs + " " + Rs + " 0 0 1 " + xy(C) + ' Z" ' + WASH + "/>" +
                  '<path d="M' + xy(A) + " A" + Rs + " " + Rs + " 0 0 1 " + xy(B) + ' Z" ' + S + "/>" + seg(A, C);
        var cx = (C[0] - O[0]) / Rs, cy = (C[1] - O[1]) / Rs, cosTex = d * d - 2 * c * c < 0 ? "-" + fr(2 * c * c - d * d, d * d) : fr(d * d - 2 * c * c, d * d);
        return {
          fig: fig(360, 190, svg + lab(A[0] - 12, A[1] + 5, "A") + lab(B[0] + 12, B[1] + 5, "B") + lab(C[0] + 14 * cx, C[1] + 14 * cy + 5, "C")),
          q: "In the figure, the diameter of the semicircle \\(ABC\\) is \\(" + d + CM + "\\). If \\(AC = " + c + CM + "\\), find the area of the shaded region correct to the nearest \\(0.01\\text{ cm}^2\\).",
          opts: vals.map(function (v) { return v.toFixed(2) + CM2; }),
          sol: "Let \\(O\\) be the centre: \\(OA = OC = " + R + "\\). By the cosine formula, \\(\\cos\\angle AOC = \\dfrac{" + R + "^2 + " + R + "^2 - " + c + "^2}{2(" + R + ")(" + R + ")} = " + cosTex + "\\), so \\(\\angle AOC \\approx " + th.toFixed(2) + "^\\circ\\).<br>" +
               "Shaded \\(= \\pi(" + R + "^2)\\times\\dfrac{" + th.toFixed(2) + "^\\circ}{360^\\circ} - \\tfrac12(" + R + "^2)\\sin " + th.toFixed(2) + "^\\circ \\approx " + segA.toFixed(2) + CM2 + "\\).",
          trap: "The radius is half the diameter (\\(" + R + "\\), not \\(" + d + "\\)) in the cosine formula and in the sector."
        };
      } },

    b_two: { shape: "B", src: "2023 P2 Q16",
      pick: function () { var g2 = ri(2, 20); return { g1: g2 + 2 * ri(1, 12), g2: g2 }; },
      make: function (p) {
        var g1 = p.g1, g2 = p.g2, R = (g1 + g2) / 2, OG = (g1 - g2) / 2, GD = Math.sqrt(g1 * g2);
        if (g1 < 1.5 * g2 || (g1 + g2) % 2) return null;   // nearly equal AG and CG would make the two circles almost coincide
        var phi = Math.acos(OG / R) * 180 / Math.PI, maj = Math.PI * R * R * (360 - 2 * phi) / 360, mnr = Math.PI * R * R * 2 * phi / 360,
            tri = OG * GD, semi = Math.PI * g1 * g2 / 2, ans = maj + tri - semi, vals = [ans, maj - semi, ans + tri, mnr + tri - semi];
        if (!safe(ans) || !vals.every(function (v) { return v > 1; })) return null;
        var s = 85 / R, O = [128, 100], G = [O[0] + OG * s, 100], gd = GD * s, Rs = R * s;
        var A = [O[0] - Rs, 100], C = [O[0] + Rs, 100], B = [G[0], 100 - gd], D = [G[0], 100 + gd], E = [G[0] - gd, 100], F = [G[0] + gd, 100];
        var svg = '<path d="M' + xy(B) + " A" + Rs.toFixed(1) + " " + Rs.toFixed(1) + " 0 1 0 " + xy(D) + " A" + gd.toFixed(1) + " " + gd.toFixed(1) + " 0 0 1 " + xy(B) + ' Z" ' + WASH + "/>" +
                  '<circle cx="' + O[0] + '" cy="100" r="' + Rs.toFixed(1) + '" ' + S + '/><circle cx="' + G[0].toFixed(1) + '" cy="100" r="' + gd.toFixed(1) + '" ' + S + "/>" + seg(A, F) + seg(B, D);
        return {
          fig: fig(360, 200, svg + (function () {   // both circles count as obstacles (as 36-sided polygons) when placing the letters
            var lines = [[A, F], [B, D]], box = { W: 360, H: 200, taken: [] };
            [[O[0], Rs], [G[0], gd]].forEach(function (c) {
              for (var i = 0; i < 36; i++) { var u = i * Math.PI / 18, v = u + Math.PI / 18; lines.push([[c[0] + c[1] * Math.cos(u), 100 + c[1] * Math.sin(u)], [c[0] + c[1] * Math.cos(v), 100 + c[1] * Math.sin(v)]]); }
            });
            return labX(G, [A, F, B, D], lines, "G", box) + labX(B, [D], lines, "B", box) + labX(D, [B], lines, "D", box) + labX(A, [F], lines, "A", box) +
                   labX(F, [A], lines, "F", box) + labX(C, [A, F], lines, "C", box) + labX(E, [A, F], lines, "E", box);
          })()),
          q: "In the figure, \\(AC\\) is a diameter of the circle \\(ABCD\\) while \\(BD\\) and \\(EF\\) are diameters of the circle \\(BEDF\\). It is given that \\(C\\) and \\(E\\) lie on \\(AF\\). Let \\(G\\) be the point of intersection of \\(AF\\) and \\(BD\\). If \\(AG = " + g1 + CM + "\\) and \\(CG = " + g2 + CM + "\\), find the area of the shaded region correct to the nearest \\(\\text{cm}^2\\).",
          opts: vals.map(function (v) { return N(Math.round(v)) + CM2; }),
          sol: "Let \\(O\\) be the centre of circle \\(ABCD\\): \\(OA = \\tfrac12(" + g1 + " + " + g2 + ") = " + R + "\\) and \\(OG = " + g1 + " - " + R + " = " + OG + "\\).<br>" +
               "\\(G\\) is the centre of circle \\(BEDF\\), so it is the mid-point of the chord \\(BD\\) and \\(BD \\perp AC\\): \\(GD = \\sqrt{" + R + "^2 - " + OG + "^2} = " + surd(g1 * g2) + "\\), and \\(\\cos\\angle DOG = \\tfrac{" + OG + "}{" + R + "}\\), so \\(\\angle DOG \\approx " + phi.toFixed(2) + "^\\circ\\).<br>" +
               "Shaded \\(=\\) major sector \\(OBAD\\) \\(+\\) \\(\\triangle OBD\\) \\(-\\) semicircle \\(BED\\) \\(\\approx " + maj.toFixed(2) + " + " + tri.toFixed(2) + " - " + semi.toFixed(2) + " \\approx " + Math.round(ans) + CM2 + "\\).",
          trap: "Add \\(\\triangle OBD\\) to the major sector, then take away only the half of circle \\(BEDF\\) on that side."
        };
      } },

    /* ===== C: one solid ===== */
    c_cone: { shape: "C", src: "2015 P2 Q16",
      pick: function () { var kn = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]); return { n: kn[0], d: kn[1], h: kn[1] * ri(2, 6), a: ri(2, 15) }; },
      make: function (p) {
        var n = p.n, d = p.d, h = p.h, a = p.a, small = h * n / d, f = h - small, V = a * a * h / 3;
        var Y = V * (d * d * d - n * n * n) / (d * d * d), X = V * n * n * n / (d * d * d), W2 = V * (d * d - n * n) / (d * d), W1 = V * (d - n) / d;
        if (![small, V, Y, X, W2, W1].every(isInt)) return null;
        return {
          q: "The height and the base radius of a right circular cone are \\(" + h + CM + "\\) and \\(" + a + CM + "\\) respectively. A frustum is made by cutting off the upper part of the cone by a plane parallel to its base. If the height of the frustum is \\(" + f + CM + "\\), find the volume of the frustum.",
          opts: [Y, X, W2, W1].map(function (v) { return pi(v) + CM3; }),
          sol: "Whole: \\(\\tfrac13\\pi(" + a + "^2)(" + h + ") = " + pi(V) + "\\). The part cut off has height \\(" + h + " - " + f + " = " + small + "\\), so \\(k = " + fr(small, h) + "\\).<br>" +
               "Frustum \\(= " + pi(V) + "\\left[1 - \\left(" + fr(n, d) + "\\right)^3\\right] = " + pi(Y) + CM3 + "\\).",
          trap: "\\(k\\) compares heights measured from the vertex (\\(" + small + "\\) out of \\(" + h + "\\)), and volumes go with \\(k^3\\), not \\(k^2\\)."
        };
      } },

    c_rect: { shape: "C", src: "2026 P2 Q17",
      pick: function () { var kn = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]), B = kn[1] * ri(2, 6); return { B: B, L: B + 2 * ri(1, 5), h: 3 * ri(2, 6), b: B * kn[0] / kn[1] }; },
      make: function (p) {
        var g = gcd(p.b, p.B), n = p.b / g, d = p.B / g, V = p.L * p.B * p.h / 3;
        var Y = V * (d * d * d - n * n * n) / (d * d * d), X = V * n * n * n / (d * d * d), W2 = V * (d * d - n * n) / (d * d), W1 = V * (d - n) / d;
        if (p.b >= p.B || ![V, Y, X, W2, W1].every(isInt)) return null;
        return {
          q: "The base of a right pyramid is a rectangle. The length and the breadth of the base are \\(" + p.L + CM + "\\) and \\(" + p.B + CM + "\\) respectively. The height of the pyramid is \\(" + p.h + CM + "\\). The pyramid is divided into a pyramid \\(X\\) and a frustum \\(Y\\) by a plane parallel to its base. If the breadth of the base of \\(X\\) is \\(" + p.b + CM + "\\), then the volume of \\(Y\\) is",
          opts: [Y, X, W2, W1].map(function (v) { return N(v) + CM3; }),
          sol: "Whole: \\(\\tfrac13(" + p.L + ")(" + p.B + ")(" + p.h + ") = " + N(V) + "\\). \\(X\\) and the whole pyramid are similar with \\(k = " + fr(p.b, p.B) + "\\).<br>" +
               "Volume of \\(Y = " + N(V) + "\\left[1 - \\left(" + fr(n, d) + "\\right)^3\\right] = " + N(Y) + CM3 + "\\).",
          trap: "\\(" + N(X) + "\\) is \\(X\\), the small pyramid. \\(Y\\) is the frustum: \\(V(1 - k^3)\\)."
        };
      } },

    c_pyr: { shape: "C", src: "2019 P2 Q15",
      pick: function () { var t = triple(); return { s: 2 * t[0], h: t[1] }; },
      make: function (p) {
        var s = p.s, h = p.h, l = isqrt(s * s / 4 + h * h);
        if (s % 2 || !l) return null;
        return {
          q: "The base of a solid right pyramid is a square of side \\(" + s + CM + "\\). If the height of the pyramid is \\(" + h + CM + "\\), then the total surface area of the pyramid is",
          opts: [s * s + 2 * s * l, 2 * s * l, 2 * s * h, s * s + 2 * s * h].map(function (v) { return N(v) + CM2; }),
          sol: "The slant height of each triangular face is \\(\\sqrt{" + h + "^2 + " + s / 2 + "^2} = " + l + "\\).<br>" +
               "Total surface area \\(= " + s + "^2 + 4\\times\\tfrac12(" + s + ")(" + l + ") = " + N(s * s) + " + " + N(2 * s * l) + " = " + N(s * s + 2 * s * l) + CM2 + "\\).",
          trap: "A triangular face needs the <strong>slant</strong> height \\(" + l + "\\), not the height \\(" + h + "\\); and the total includes the square base."
        };
      } },

    c_conehemi: { shape: "C", src: "2013 P2 Q17",
      pick: function () { var t = triple(); return { r: t[0], h: t[1] }; },
      make: function (p) {
        var r = p.r, h = p.h, l = isqrt(r * r + h * h);
        if (!l || r > 30) return null;
        return {
          q: "A solid consists of a right circular cone and a hemisphere with a common base. The base radius and the height of the cone are \\(" + r + CM + "\\) and \\(" + h + CM + "\\) respectively. Find the total surface area of the solid.",
          opts: [r * l + 2 * r * r, r * h + 2 * r * r, 2 * r * l + 2 * r * r, r * l + 4 * r * r].map(function (v) { return pi(v) + CM2; }),
          sol: "Slant height \\(= \\sqrt{" + r + "^2 + " + h + "^2} = " + l + "\\).<br>" +
               "Total surface area \\(= \\pi(" + r + ")(" + l + ") + 2\\pi(" + r + "^2) = " + pi(r * l) + " + " + pi(2 * r * r) + " = " + pi(r * l + 2 * r * r) + CM2 + "\\).",
          trap: "The common base is inside the solid: count the cone's curved surface and the hemisphere's curved surface \\(2\\pi r^2\\) only."
        };
      } },

    c_prism: { shape: "C", src: "2018 P2 Q15",
      pick: function () { var t = triple(); return { a: t[0], c: t[2], L: ri(3, 20) }; },
      make: function (p) {
        var a = p.a, c = p.c, L = p.L, b = isqrt(c * c - a * a);
        if (!b || (a * c * L) % 2 || (b * c * L) % 2 || (a * b * L) % 2) return null;
        return {
          q: "The base of a solid right prism is a right-angled triangle. The hypotenuse and one of the other two sides of the triangle are \\(" + c + CM + "\\) and \\(" + a + CM + "\\) respectively. If the prism is \\(" + L + CM + "\\) long, then the volume of the prism is",
          opts: [a * b * L / 2, a * c * L / 2, a * b * L, b * c * L / 2].map(function (v) { return N(v) + CM3; }),
          sol: "The third side is \\(\\sqrt{" + c + "^2 - " + a + "^2} = " + b + "\\).<br>" +
               "Volume \\(= \\tfrac12(" + a + ")(" + b + ")(" + L + ") = " + N(a * b * L / 2) + CM3 + "\\).",
          trap: "The two sides at the right angle make the base and height of the triangle; the hypotenuse does not."
        };
      } },

    c_hex: { shape: "C", src: "2021 P2 Q15",
      pick: function () { return { s: ri(2, 12), k: ri(1, 4) }; },
      make: function (p) {
        var s = p.s, k = p.k, V = 9 * k * s * s / 2, Bc = 3 * s * s / 2, Lc = 6 * s * k, r3 = Math.sqrt(3);
        var vals = [2 * Bc + Lc, Bc + Lc, Bc, Lc].map(function (c) { return c * r3; });
        if (!isInt(V) || !safe(vals[0])) return null;
        var h = (k === 1 ? "" : k) + "\\sqrt{3}";
        return {
          q: "The base of a solid right prism is a regular \\(6\\)-sided polygon of side \\(" + s + CM + "\\). If the volume of the prism is \\(" + N(V) + CM3 + "\\), find the total surface area of the prism correct to the nearest \\(\\text{cm}^2\\).",
          opts: vals.map(function (v) { return N(Math.round(v)) + CM2; }),
          sol: "A regular hexagon is six equilateral triangles: base area \\(= 6\\times\\tfrac{\\sqrt{3}}{4}(" + s + "^2) = " + fr(3 * s * s, 2) + "\\sqrt{3}\\).<br>" +
               "Height \\(= \\dfrac{" + N(V) + "}{" + fr(3 * s * s, 2) + "\\sqrt{3}} = " + h + "\\).<br>" +
               "Total surface area \\(= 2(" + fr(3 * s * s, 2) + "\\sqrt{3}) + 6(" + s + ")(" + h + ") = " + N(2 * Bc + Lc) + "\\sqrt{3} \\approx " + N(Math.round(vals[0])) + CM2 + "\\).",
          trap: "The total surface area is two hexagons and six rectangles; one base alone gives \\(" + N(Math.round(vals[1])) + "\\)."
        };
      } },

    c_trap: { shape: "C", src: "2016 P2 Q18",
      pick: function () { var t = triple(); return { h: t[0], c: t[2], a: ri(2, 12), L: ri(3, 15) }; },
      make: function (p) {
        var a = p.a, h = p.h, c = p.c, L = p.L, d = isqrt(c * c - h * h);
        if (!d) return null;
        var b = a + d, vals = [(a + b) * h * L / 2, (a + d) * h * L / 2, (a + b) * c * L / 2, (a + c) * h * L / 2];
        if (!vals.every(isInt)) return null;
        var u = Math.min(250 / b, 120 / h), A = [55, 30], D = [55 + a * u, 30], B = [55, 30 + h * u], C = [55 + b * u, 30 + h * u], m = 9;
        var svg = '<polygon points="' + [A, D, C, B].map(xy).join(" ") + '" ' + S + "/>" +
                  '<path d="M' + (A[0] + m) + "," + A[1] + " V" + (A[1] + m) + " H" + A[0] + " M" + (B[0] + m) + "," + B[1] + " V" + (B[1] - m) + " H" + B[0] + '" stroke="#231f20" stroke-width="1.2" fill="none"/>';
        return {
          fig: fig(360, 60 + h * u, svg + lab(A[0] - 11, A[1] + 4, "A") + lab(D[0] + 8, D[1] - 6, "D") + lab(B[0] - 11, B[1] + 6, "B") + lab(C[0] + 11, C[1] + 6, "C")),
          q: "The figure shows the cross-section \\(ABCD\\) of a solid right prism, where \\(AD \\parallel BC\\) and \\(\\angle ABC = 90^\\circ\\). If \\(AD = " + a + CM + "\\), \\(AB = " + h + CM + "\\), \\(CD = " + c + CM + "\\) and the prism is \\(" + L + CM + "\\) long, then the volume of the prism is",
          opts: vals.map(function (v) { return N(v) + CM3; }),
          sol: "Draw \\(DK \\perp BC\\): \\(DK = AB = " + h + "\\) and \\(KC = \\sqrt{" + c + "^2 - " + h + "^2} = " + d + "\\), so \\(BC = " + a + " + " + d + " = " + b + "\\).<br>" +
               "Volume \\(= \\tfrac12(" + a + " + " + b + ")(" + h + ")\\times " + L + " = " + N(vals[0]) + CM3 + "\\).",
          trap: "\\(BC = AD + KC\\): add the \\(" + a + "\\) back on. The trapezium's height is \\(AB\\), not the slant side \\(CD\\)."
        };
      } },

    /* ===== D: two solids ===== */
    d_letters: { shape: "D", src: "2020 P2 Q16",
      pick: function () { return { p: ri(2, 6), q: ri(2, 7), s: ri(2, 7), t: ri(2, 7), B: ri(1, 9) }; },
      make: function (P) {
        var p = P.p, q = P.q, s = P.s, t = P.t, B = P.B, cyl = p * p * q * B, cone3 = s * s * t * B, swap3 = t * t * s * B;
        if ((p === s && q === t) || cone3 % 3 || swap3 % 3 || cyl > 2000) return null;
        function c(v, l) { return (v === 1 ? "" : v) + l; }
        return {
          q: "If the volume of a right circular cylinder of base radius \\(" + c(p, "a") + CM + "\\) and height \\(" + c(q, "b") + CM + "\\) is \\(" + N(cyl) + CM3 + "\\), then the volume of a right circular cone of base radius \\(" + c(s, "a") + CM + "\\) and height \\(" + c(t, "b") + CM + "\\) is",
          opts: [cone3 / 3, cone3, swap3 / 3, cyl].map(function (v) { return N(v) + CM3; }),
          sol: "Cylinder: \\(\\pi(" + c(p, "a") + ")^2(" + c(q, "b") + ") = " + p * p * q + "\\pi a^2 b = " + N(cyl) + "\\), so \\(\\pi a^2 b = " + B + "\\).<br>" +
               "Cone: \\(\\tfrac13\\pi(" + c(s, "a") + ")^2(" + c(t, "b") + ") = \\dfrac{" + s * s * t + "}{3}\\pi a^2 b = " + N(cone3 / 3) + "\\).",
          trap: "\\(" + N(cone3) + "\\) forgets the \\(\\tfrac13\\); you never need \\(a\\) or \\(b\\) on their own."
        };
      } },

    d_multi: { shape: "D", src: "2017 P2 Q15",
      pick: function () { return { m: ri(2, 4), n: ri(2, 5), V: 3 * ri(1, 20) }; },
      make: function (p) {
        var m = p.m, n = p.n, V = p.V, opts = [3 * n * V / (m * m), 3 * V / (m * m), m * m * V / 3, m * m * V];
        if (!opts.every(isInt)) return null;
        return {
          q: "The base radius of a right circular cone is \\(" + m + "\\) times the base radius of a right circular cylinder while the height of the cylinder is \\(" + n + "\\) times the height of the cone. If the volume of the cone is \\(" + pi(V) + CM3 + "\\), then the volume of the cylinder is",
          opts: opts.map(function (v) { return pi(v) + CM3; }),
          sol: "Let the cylinder's radius be \\(r\\) and the cone's height be \\(h\\). Cone: \\(\\tfrac13\\pi(" + m + "r)^2 h = " + pi(V) + "\\), so \\(\\pi r^2 h = " + pi(opts[1]) + "\\).<br>" +
               "Cylinder: \\(\\pi r^2(" + n + "h) = " + n + "\\times" + pi(opts[1]) + " = " + pi(opts[0]) + CM3 + "\\).",
          trap: "Square the radius factor (\\(" + m + "^2\\)) and remember the cone's \\(\\tfrac13\\)."
        };
      } },

    d_hemi: { shape: "D", src: "2021 P2 Q16",
      pick: function () { return { a: ri(1, 5), b: ri(2, 7), k: ri(1, 5) }; },
      make: function (p) {
        var a = p.a, b = p.b, k = p.k, S = 3 * (a * a + b * b) * k * k;
        var diff = 2 * k * k * k * (b * b * b - a * a * a) / 3, sum = 2 * k * k * k * (b * b * b + a * a * a) / 3;
        if (a >= b || gcd(a, b) !== 1 || !isInt(diff) || !isInt(sum) || S > 3000) return null;
        return {
          q: "The sum of the total surface areas of two solid hemispheres is \\(" + pi(S) + CM2 + "\\). If the ratio of the radius of the smaller hemisphere to the radius of the larger hemisphere is \\(" + a + " : " + b + "\\), then the difference of the volumes of the two hemispheres is",
          opts: [diff, sum, 2 * diff, 2 * sum].map(function (v) { return pi(v) + CM3; }),
          sol: "Let the radii be \\(" + (a === 1 ? "" : a) + "r\\) and \\(" + b + "r\\). A hemisphere's total surface area is \\(3\\pi r^2\\): \\(3\\pi(" + a * a + " + " + b * b + ")r^2 = " + pi(S) + "\\), so \\(r = " + k + "\\).<br>" +
               "Difference \\(= \\tfrac23\\pi(" + b * k + "^3 - " + a * k + "^3) = " + pi(diff) + CM3 + "\\).",
          trap: "A hemisphere's total surface area is \\(3\\pi r^2\\) (curved \\(2\\pi r^2\\) plus the flat circle), and its volume is \\(\\tfrac23\\pi r^3\\)."
        };
      } },

    d_ratio: { shape: "D", src: "2022 P2 Q15",
      pick: function () { return { n: ri(1, 4), vol: Math.random() < 0.5 }; },
      make: function (p) {
        var n = p.n, h = n === 1 ? "equal to its base radius" : n === 2 ? "equal to its base diameter" : "\\(" + n + "\\) times its base radius";
        var opts = p.vol ? [ratio(2, 3 * n), ratio(4, 3 * n), ratio(2, n), ratio(1, n)]
                         : [ratio(3, 2 + 2 * n), ratio(2, 2 + 2 * n), ratio(3, 2 * n), ratio(3, 1 + 2 * n)];
        var what = p.vol ? "volume" : "total surface area";
        return {
          q: "The radius of a solid hemisphere and the base radius of a solid right circular cylinder are equal. If the height of the cylinder is " + h + ", then the ratio of the " + what + " of the hemisphere to the " + what + " of the cylinder is",
          opts: opts,
          sol: "Let the radius be \\(r\\), so the cylinder's height is \\(" + (n === 1 ? "" : n) + "r\\).<br>" +
               (p.vol ? "\\(\\tfrac23\\pi r^3 : \\pi r^2(" + (n === 1 ? "" : n) + "r) = 2 : " + 3 * n + " = " + opts[0] + "\\)."
                      : "\\(3\\pi r^2 : \\left[2\\pi r^2 + 2\\pi r(" + (n === 1 ? "" : n) + "r)\\right] = 3 : " + (2 + 2 * n) + " = " + opts[0] + "\\)."),
          trap: p.vol ? "A hemisphere is half a sphere: \\(\\tfrac23\\pi r^3\\), not \\(\\tfrac43\\pi r^3\\)."
                      : "Total surface area: the hemisphere's flat face and both circles of the cylinder count."
        };
      } },

    d_cube: { shape: "D", src: "2023 P2 Q15",
      pick: function () { return { s: 12 * ri(1, 8), f: pick([6, 4]) }; },
      make: function (p) {
        var s = p.s, f = p.f, opts = [2 * s / f, s / f, 4 * s / f, 3 * s / f];
        if (!opts.every(isInt)) return null;
        return {
          q: "The length of a side of a solid cube is \\(" + s + CM + "\\). The volume of a solid right circular cylinder is equal to the volume of the cube while the curved surface area of the cylinder is equal to " +
             (f === 6 ? "the total surface area of the cube" : "the total area of the four side faces of the cube") + ". Find the base radius of the cylinder.",
          opts: opts.map(function (v) { return N(v) + CM; }),
          sol: "\\(\\pi r^2 h = " + s + "^3\\) and \\(2\\pi r h = " + f + "(" + s + "^2)\\). Divide: \\(\\dfrac{r}{2} = \\dfrac{" + s + "^3}{" + f + "(" + s + "^2)} = " + fr(s, f) + "\\), so \\(r = " + opts[0] + "\\).",
          trap: "Divide the two equations: \\(\\pi\\) and \\(h\\) cancel, leaving \\(\\tfrac{r}{2}\\). Do not drop the 2."
        };
      } },

    d_cone_r: { shape: "D", src: "2024 P2 Q16",
      pick: function () {
        var R = 5 * ri(2, 8), r = 5 * ri(2, 12), p = ri(2, 40), q = ri(2, 40), g = gcd(3 * R * R * p, r * r * q);
        return { R: R, p: p, q: q, u: 3 * R * R * p / g, w: r * r * q / g };
      },
      make: function (P) {
        var R = P.R, p = P.p, q = P.q, u = P.u, w = P.w, r2 = 3 * R * R * p * w / (q * u);
        if (gcd(p, q) !== 1 || u === w || u > 40 || w > 40 || !isInt(r2) || !isqrt(Math.round(r2))) return null;
        var r = isqrt(Math.round(r2));
        var slips = [R * R * p * w / (q * u), 3 * R * R * p * u / (q * w), 3 * R * R * q * w / (p * u)].map(Math.sqrt);
        if (!slips.every(safe)) return null;
        return {
          q: "The ratio of the height of a right circular cylinder to the height of a right circular cone is \\(" + p + " : " + q + "\\) while the ratio of the volume of the cylinder to the volume of the cone is \\(" + u + " : " + w + "\\). If the base radius of the cylinder is \\(" + R + CM + "\\), then the base radius of the cone is",
          opts: [r].concat(slips.map(Math.round)).map(function (v) { return N(v) + CM; }),
          sol: "Take the heights as \\(" + p + "\\) and \\(" + q + "\\) (only their ratio matters). Let the cone's radius be \\(r\\).<br>" +
               "\\(\\dfrac{\\pi(" + R + "^2)(" + p + ")}{\\tfrac13\\pi r^2(" + q + ")} = \\dfrac{" + u + "}{" + w + "}\\), so \\(r^2 = " + N(r * r) + "\\) and \\(r = " + r + "\\).",
          trap: "Keep the cone's \\(\\tfrac13\\), and put each ratio the right way up: cylinder over cone."
        };
      } },

    d_quad: { shape: "D", src: "2025 P2 Q16",
      pick: function () { return { r: 3 * ri(1, 4), h: ri(5, 40) }; },
      make: function (p) {
        var r = p.r, h = p.h, Tsa = 2 * r * r + 2 * r * h, V = r * r * r;
        if (V % 3) return null;
        return {
          q: "The height and the total surface area of a solid right circular cylinder are \\(" + h + CM + "\\) and \\(" + pi(Tsa) + CM2 + "\\) respectively. If the radius of a solid sphere is equal to the base radius of the cylinder, then the volume of the sphere is",
          opts: [4 * V / 3, 2 * V / 3, 8 * V / 3, 4 * V].map(function (v) { return pi(v) + CM3; }),
          sol: "\\(2\\pi r^2 + 2\\pi r(" + h + ") = " + pi(Tsa) + "\\), so \\(r^2 + " + h + "r - " + Tsa / 2 + " = 0\\), \\((r - " + r + ")(r + " + (r + h) + ") = 0\\) and \\(r = " + r + "\\).<br>" +
               "Volume of the sphere \\(= \\tfrac43\\pi(" + r + "^3) = " + pi(4 * V / 3) + CM3 + "\\).",
          trap: "The cylinder's total surface area has two circles. The sphere's volume is \\(\\tfrac43\\pi r^3\\) (\\(\\tfrac23\\) is a hemisphere)."
        };
      } },

    /* ===== E: area ratios ===== */
    e_par: { shape: "E", src: "2020 P2 Q17",
      pick: function () { return { a: ri(1, 3), b: ri(1, 3), c: ri(1, 3) }; },
      make: function (p) {
        var a = p.a, b = p.b, c = p.c, A1 = (a + b) * (a + b) - a * a, A2 = (a + b + c) * (a + b + c) - (a + b) * (a + b);
        if (gcd(gcd(a, b), c) !== 1) return null;
        var opts = [ratio(A1, A2), ratio((a + b) * (a + b), (a + b + c) * (a + b + c)), ratio(a + b, a + b + c), ratio(a, a + b)];
        var L = 300, y0 = 150, xs = [a, a + b, a + b + c].map(function (v) { return 30 + v / (a + b + c) * L; });
        var svg = '<polygon points="30,' + y0 + " " + xs[2] + "," + y0 + " " + (xs[2] - 40) + ',20" ' + S + "/>", top = [];
        xs.slice(0, 2).forEach(function (x) { var f = (x - 30) / L, tx = 30 + f * (L - 40), ty = y0 - f * 130; top.push([tx, ty]); svg += '<line x1="' + x + '" y1="' + y0 + '" x2="' + tx + '" y2="' + ty + '" ' + S + "/>"; });
        return {
          fig: fig(360, 175, svg + lab(22, y0 + 18, "O") + lab(xs[0], y0 + 20, "P") + lab(xs[1], y0 + 20, "Q") + lab(xs[2], y0 + 20, "R") +
                             lab(top[0][0] - 10, top[0][1] - 4, "U") + lab(top[1][0] - 10, top[1][1] - 4, "T") + lab(xs[2] - 40, 14, "S")),
          q: "In the figure, \\(P\\) and \\(Q\\) lie on \\(OR\\), and \\(U\\) and \\(T\\) lie on \\(OS\\), such that \\(OP : PQ : QR = " + a + " : " + b + " : " + c + "\\) and \\(PU \\parallel QT \\parallel RS\\). The ratio of the area of the trapezium \\(PQTU\\) to the area of the trapezium \\(QRST\\) is",
          opts: opts,
          sol: "\\(OP : OQ : OR = " + a + " : " + (a + b) + " : " + (a + b + c) + "\\), and the three triangles at \\(O\\) are similar, so their areas are \\(" + a * a + " : " + (a + b) * (a + b) + " : " + (a + b + c) * (a + b + c) + "\\).<br>" +
               "\\(PQTU : QRST = (" + (a + b) * (a + b) + " - " + a * a + ") : (" + (a + b + c) * (a + b + c) + " - " + (a + b) * (a + b) + ") = " + opts[0] + "\\).",
          trap: "Square the distances <strong>from \\(O\\)</strong>, then subtract. Squaring \\(PQ : QR\\) gives \\(" + ratio(b * b, c * c) + "\\)."
        };
      } },

    e_pgram: { shape: "E", src: "2018 P2 Q16",
      pick: function () { var m = ri(1, 5), n = ri(1, 5); return { m: m, n: n, X: ri(1, 4) * m * (m + n) }; },
      make: function (p) {
        var m = p.m, n = p.n, X = p.X, BFE = X * m / (m + n), DFA = X * (m + n) / m, ABD = X + DFA, ans = ABD - BFE;
        if (gcd(m, n) !== 1 || !isInt(BFE) || !isInt(DFA) || ans > 2000) return null;
        var ex = 30 + m / (m + n) * 250, F = along([30, 150], [330, 30], m / (2 * m + n));   // BF : FD = m : (m + n)
        var svg = '<polygon points="30,150 280,150 330,30 80,30" ' + S + '/><line x1="80" y1="30" x2="' + ex + '" y2="150" ' + S + '/><line x1="30" y1="150" x2="330" y2="30" ' + S + "/>";
        return {
          fig: fig(360, 175, svg + lab(72, 22, "A") + lab(22, 166, "B") + lab(288, 166, "C") + lab(338, 24, "D") + lab(ex, 168, "E") + labX(F, [[80, 30], [ex, 150], [30, 150], [330, 30]],
                    [[[30, 150], [280, 150]], [[280, 150], [330, 30]], [[330, 30], [80, 30]], [[80, 30], [30, 150]], [[80, 30], [ex, 150]], [[30, 150], [330, 30]]], "F")),
          q: "In the figure, \\(ABCD\\) is a parallelogram. \\(E\\) is a point lying on \\(BC\\) such that \\(BE : EC = " + m + " : " + n + "\\). \\(AE\\) and \\(BD\\) intersect at \\(F\\). If the area of \\(\\triangle ABF\\) is \\(" + X + CM2 + "\\), then the area of the quadrilateral \\(CDFE\\) is",
          opts: [ans, ABD, DFA, ABD + BFE].map(function (v) { return N(v) + CM2; }),
          sol: "\\(\\triangle BFE \\sim \\triangle DFA\\) with \\(BE : DA = " + m + " : " + (m + n) + "\\), so \\(EF : FA = BF : FD = " + m + " : " + (m + n) + "\\).<br>" +
               "Same height: \\(\\triangle BFE = " + BFE + "\\) and \\(\\triangle DFA = " + DFA + "\\). Then \\(\\triangle BCD = \\triangle ABD = " + X + " + " + DFA + " = " + ABD + "\\).<br>" +
               "\\(CDFE = " + ABD + " - " + BFE + " = " + ans + CM2 + "\\).",
          trap: "\\(BE : DA\\) is \\(" + m + " : " + (m + n) + "\\), not \\(" + m + " : " + n + "\\): \\(AD = BC = BE + EC\\)."
        };
      } },

    e_tri: { shape: "E", src: "2022 P2 Q17",
      pick: function () {
        var a = ri(1, 7), b = ri(1, 7), c = ri(1, 7), d = ri(1, 7), part = b * c, rest = (a + b) * (c + d) - part;
        return { a: a, b: b, c: c, d: d, X: rest / gcd(part, rest) * ri(1, 3) };
      },
      make: function (p) {
        var a = p.a, b = p.b, c = p.c, d = p.d, X = p.X, Tot = (a + b) * (c + d), ans = X * b * c / (Tot - b * c);
        if (gcd(a, b) !== 1 || gcd(c, d) !== 1 || !isInt(ans) || ans < 3 || ans > 500) return null;
        var P = [30, 160], Q = [150, 20], R = [340, 160], M = along(P, Q, a / (a + b)), Nn = along(Q, R, c / (c + d));
        var svg = '<polygon points="' + xy(P) + " " + xy(Q) + " " + xy(R) + '" ' + S + '/><line x1="' + M[0] + '" y1="' + M[1] + '" x2="' + Nn[0] + '" y2="' + Nn[1] + '" ' + S + "/>";
        return {
          fig: fig(360, 185, svg + lab(20, 176, "P") + lab(150, 14, "Q") + lab(348, 176, "R") + lab(M[0] - 14, M[1] + 4, "M") + lab(Nn[0] + 14, Nn[1] - 2, "N")),
          q: "In the figure, \\(M\\) and \\(N\\) are points lying on \\(PQ\\) and \\(QR\\) respectively such that \\(PM : MQ = " + a + " : " + b + "\\) and \\(QN : NR = " + c + " : " + d + "\\). If the area of the quadrilateral \\(MNRP\\) is \\(" + X + CM2 + "\\), then the area of \\(\\triangle MNQ\\) is",
          opts: [ans, ans - 1, ans + 1, ans + 2].map(function (v) { return v + CM2; }),
          sol: "\\(\\triangle MNQ\\) and \\(\\triangle PQR\\) share \\(\\angle Q\\): \\(\\dfrac{\\triangle MNQ}{\\triangle PQR} = \\dfrac{MQ}{PQ}\\times\\dfrac{QN}{QR} = \\dfrac{" + b + "}{" + (a + b) + "}\\times\\dfrac{" + c + "}{" + (c + d) + "} = \\dfrac{" + b * c + "}{" + Tot + "}\\).<br>" +
               "So \\(\\triangle MNQ : MNRP = " + b * c + " : " + (Tot - b * c) + "\\), and \\(\\triangle MNQ = " + X + "\\times\\dfrac{" + b * c + "}{" + (Tot - b * c) + "} = " + ans + CM2 + "\\).",
          trap: "Use the two sides at the shared angle \\(Q\\): \\(MQ\\) and \\(QN\\), each as a fraction of the whole side."
        };
      } },

    e_pqrs: { shape: "E", src: "2023 P2 Q17",
      pick: function () { var m = ri(1, 5), n = ri(2, 7); return { m: m, n: n, T: n * (m + n) * ri(1, 4) }; },
      make: function (p) {
        var m = p.m, n = p.n, Tot = p.T, PXY = Tot * m * m / (n * (m + n)), QRYX = Tot - PXY, RSY = Tot * n / (m + n), PSY = Tot * m / (m + n), alt = Tot * m / n;
        if (m >= n || gcd(m, n) !== 1 || ![PXY, RSY, PSY, alt].every(isInt) || Tot > 1500) return null;
        var P = [30, 150], Q = [280, 150], R = [330, 30], Sv = [80, 30], X = along(P, Q, m / n), Y = along(P, R, m / (m + n));
        var svg = '<polygon points="' + xy(P) + " " + xy(Q) + " " + xy(R) + " " + xy(Sv) + '" ' + S + '/><line x1="30" y1="150" x2="330" y2="30" ' + S + '/><line x1="80" y1="30" x2="' + X[0] + '" y2="150" ' + S + "/>";
        return {
          fig: fig(360, 175, svg + lab(22, 166, "P") + lab(288, 166, "Q") + lab(338, 24, "R") + lab(72, 22, "S") + lab(X[0], 168, "X") + labX(Y, [P, R, Sv, X], [[P, Q], [Q, R], [R, Sv], [Sv, P], [P, R], [Sv, X]], "Y")),
          q: "In the figure, \\(PQRS\\) is a parallelogram. Let \\(X\\) be a point lying on \\(PQ\\). Denote the point of intersection of \\(PR\\) and \\(SX\\) by \\(Y\\). If the area of \\(\\triangle PXY\\) and the area of the quadrilateral \\(QRYX\\) are \\(" + PXY + CM2 + "\\) and \\(" + QRYX + CM2 + "\\) respectively, then the area of \\(\\triangle RSY\\) is",
          opts: [RSY, PSY, QRYX, alt].map(function (v) { return N(v) + CM2; }),
          sol: "\\(\\triangle PRS = \\triangle PQR = " + PXY + " + " + QRYX + " = " + Tot + "\\). Let \\(\\triangle RSY = A\\), so \\(\\triangle PSY = " + Tot + " - A\\).<br>" +
               "\\(\\triangle PXY \\sim \\triangle RSY\\), and \\(\\triangle PSY\\), \\(\\triangle RSY\\) have the same height, so \\(\\left(\\dfrac{" + Tot + " - A}{A}\\right)^2 = \\left(\\dfrac{PY}{RY}\\right)^2 = \\dfrac{" + PXY + "}{A}\\).<br>" +
               "\\((" + Tot + " - A)^2 = " + PXY + "A\\). The root less than \\(" + Tot + "\\) is \\(A = " + RSY + "\\).",
          trap: "The quadratic has two roots; reject the one bigger than the whole triangle \\(PRS\\)."
        };
      } },

    e_map: { shape: "E", src: "2013 P2 Q12",
      pick: function () { return { n: pick([200, 400, 500, 1000, 2000, 2500, 5000]), a: ri(2, 60) }; },
      make: function (p) {
        var n = p.n, a = p.a, A = a * n * n / 10000, k = n * n / 10000;
        if (!isInt(A) || !isInt(k) || A > 2e6) return null;
        return {
          q: "The actual area of a playground is \\(" + N(A) + "\\text{ m}^2\\). If the area of the playground on a map is \\(" + a + CM2 + "\\), then the scale of the map is",
          opts: ["1 : " + N(n), "1 : " + N(n * n), "1 : " + N(k), "1 : " + N(n / 10)],
          sol: "\\(1\\text{ m}^2 = 10\\,000\\text{ cm}^2\\), so \\(\\dfrac{" + a + "\\text{ cm}^2}{" + N(A) + "\\times 10\\,000\\text{ cm}^2} = \\dfrac{1}{" + N(n * n) + "} = \\left(\\dfrac{1}{" + N(n) + "}\\right)^2\\).<br>" +
               "Areas go with the square of the scale, so the scale is \\(1 : " + N(n) + "\\).",
          trap: "Change \\(\\text{m}^2\\) to \\(\\text{cm}^2\\) first (\\(\\times 10\\,000\\)), then take the square root."
        };
      } },

    e_pgG: { shape: "E", src: "2012 P2 Q17",
      pick: function () { return { p: ri(1, 5), q: ri(1, 5), r: ri(1, 3), s: ri(1, 3), X: ri(1, 30) }; },
      make: function (P) {
        var p = P.p, q = P.q, r = P.r, s = P.s, X = P.X, w = p + q, AE = p * (r + s) / s;
        if (gcd(p, q) !== 1 || gcd(r, s) !== 1 || AE >= w) return null;
        var GAE = X * (r + s) * (r + s) / (s * s), ADFE = GAE - X, ABCD = ADFE * 2 * w / (p + AE), vals = [ABCD, GAE, 2 * ADFE, ADFE * w / p];
        if (!vals.every(isInt) || ABCD > 2000) return null;
        var hh = 0.5 * w, sx = 0.3 * w;
        var pts = { A: [0, 0], B: [w, 0], C: [sx + w, hh], D: [sx, hh], E: [AE, 0], F: [sx + p, hh], G: [sx * (r + s) / r, hh * (r + s) / r] };
        return {
          fig: drawFig(pts, [["A", "B"], ["B", "C"], ["C", "D"], ["A", "G"], ["E", "G"]]),
          q: "In the figure, \\(ABCD\\) is a parallelogram. \\(E\\) and \\(F\\) are points lying on \\(AB\\) and \\(CD\\) respectively. \\(AD\\) produced and \\(EF\\) produced meet at \\(G\\). It is given that \\(DF : FC = " + p + " : " + q + "\\) and \\(AD : DG = " + r + " : " + s + "\\). If the area of \\(\\triangle DFG\\) is \\(" + X + CM2 + "\\), then the area of the parallelogram \\(ABCD\\) is",
          opts: vals.map(function (v) { return N(Math.round(v)) + CM2; }),
          sol: "\\(DF \\parallel AE\\), so \\(\\triangle GDF \\sim \\triangle GAE\\) with \\(GD : GA = " + s + " : " + (r + s) + "\\): \\(\\triangle GAE = " + X + "\\left(" + fr(r + s, s) + "\\right)^2 = " + GAE + "\\) and \\(ADFE = " + GAE + " - " + X + " = " + ADFE + "\\).<br>" +
               "Let \\(DF = " + p + "\\) units: \\(AB = CD = " + w + "\\) and \\(AE = " + fr(p * (r + s), s) + "\\). \\(ADFE\\) and \\(ABCD\\) have the same height, so \\(ABCD = " + ADFE + "\\times\\dfrac{2(" + w + ")}{" + p + " + " + fr(p * (r + s), s) + "} = " + N(ABCD) + CM2 + "\\).",
          trap: "A trapezium and a parallelogram of the same height compare by their parallel sides: \\(DF + AE\\) against \\(2CD\\)."
        };
      } },

    e_trapF: { shape: "E", src: "2013 P2 Q18",
      pick: function () {
        var p = ri(1, 4), q = p + ri(1, 3), s = ri(1, 3), t = ri(1, 3), a = p * (s + t), e = q * t, g = gcd(a, e);
        return { p: p, q: q, s: s, t: t, X: (e / g) * (e / g) * ri(1, 6) };
      },
      make: function (P) {
        var p = P.p, q = P.q, s = P.s, t = P.t, X = P.X, g = gcd(p * (s + t), q * t), a = p * (s + t) / g, e = q * t / g;
        if (gcd(p, q) !== 1 || gcd(s, t) !== 1 || p >= q) return null;
        var ADF = X * a * a / (e * e), CDF = X * a / e, ACD = ADF + CDF, ABC = ACD * q / p, tot = ACD + ABC, vals = [tot, tot - ADF, 2 * ACD, ABC];
        if (!vals.every(isInt) || tot > 3000) return null;
        var off = (q - p) * 0.35, hh = 0.45 * q, A = [off, hh], B = [0, 0], C = [q, 0], D = [off + p, hh], E = [q * s / (s + t), 0];
        return {
          fig: drawFig({ A: A, B: B, C: C, D: D, E: E, F: cross(A, C, D, E) }, [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["A", "C"], ["D", "E"]]),
          q: "In the figure, \\(ABCD\\) is a trapezium with \\(AD \\parallel BC\\) and \\(AD : BC = " + p + " : " + q + "\\). " +
             (s === t ? "Let \\(E\\) be the mid-point of \\(BC\\)." : "\\(E\\) is a point lying on \\(BC\\) such that \\(BE : EC = " + s + " : " + t + "\\).") +
             " \\(AC\\) and \\(DE\\) intersect at \\(F\\). If the area of \\(\\triangle CEF\\) is \\(" + X + CM2 + "\\), then the area of the trapezium \\(ABCD\\) is",
          opts: vals.map(function (v) { return N(Math.round(v)) + CM2; }),
          sol: "Let \\(AD = " + p * (s + t) + "\\) units: then \\(BC = " + q * (s + t) + "\\) and \\(EC = " + q * t + "\\), so \\(AD : EC = " + a + " : " + e + "\\).<br>" +
               "\\(\\triangle ADF \\sim \\triangle CEF\\): \\(\\triangle ADF = " + X + "\\left(" + fr(a, e) + "\\right)^2 = " + ADF + "\\). \\(\\triangle CDF\\) and \\(\\triangle CEF\\) share a height and \\(DF : FE = " + a + " : " + e + "\\), so \\(\\triangle CDF = " + CDF + "\\).<br>" +
               "\\(\\triangle ACD = " + ADF + " + " + CDF + " = " + ACD + "\\), and \\(\\triangle ABC = " + ACD + "\\times" + fr(q, p) + " = " + ABC + "\\) (same height, bases \\(BC : AD\\)). Trapezium \\(= " + N(tot) + CM2 + "\\).",
          trap: "Compare \\(AD\\) with \\(EC\\), not with \\(BC\\): the similar triangles are \\(ADF\\) and \\(CEF\\)."
        };
      } },

    e_pgFG: { shape: "E", src: "2015 P2 Q17",
      pick: function () { var p = ri(1, 4); return { p: p, q: ri(1, 4), X: p * p * p * ri(1, 4) }; },
      make: function (P) {
        var p = P.p, q = P.q, X = P.X, k = q / p, vals = [X * k * k * k, X * k * k, X * k, X * (p + q) / p];
        if (gcd(p, q) !== 1 || p === q || k > 2.5 || k < 0.4 || !vals.every(isInt) || vals[0] > 2000) return null;
        var A = [0, 0], B = [1, 0], D = [0.3, 0.55], C = [1.3, 0.55], E = [0.3 + p / (p + q), 0.55];
        return {
          fig: drawFig({ A: A, B: B, C: C, D: D, E: E, F: cross(A, D, B, E), G: cross(A, E, B, C) }, [["A", "B"], ["B", "G"], ["A", "G"], ["A", "F"], ["F", "B"], ["D", "C"]]),
          q: "In the figure, \\(ABCD\\) is a parallelogram. \\(E\\) is a point lying on \\(CD\\) such that \\(DE : EC = " + p + " : " + q + "\\). \\(AD\\) produced and \\(BE\\) produced meet at \\(F\\) while \\(AE\\) produced and \\(BC\\) produced meet at \\(G\\). If the area of \\(\\triangle DEF\\) is \\(" + X + CM2 + "\\), then the area of \\(\\triangle CEG\\) is",
          opts: vals.map(function (v) { return N(Math.round(v)) + CM2; }),
          sol: "\\(\\triangle DEF \\sim \\triangle CEB\\) with \\(DE : EC = " + p + " : " + q + "\\), so \\(DF : CB = " + p + " : " + q + "\\), that is \\(DF : DA = " + p + " : " + q + "\\).<br>" +
               "\\(\\triangle DEA\\) and \\(\\triangle DEF\\) share a height: \\(\\triangle DEA = " + X + "\\times" + fr(q, p) + " = " + vals[2] + "\\).<br>" +
               "\\(\\triangle CEG \\sim \\triangle DEA\\) with \\(EC : ED = " + q + " : " + p + "\\): \\(\\triangle CEG = " + vals[2] + "\\left(" + fr(q, p) + "\\right)^2 = " + N(vals[0]) + CM2 + "\\).",
          trap: "Two steps, not one: a same-height step (\\(\\times" + fr(q, p) + "\\)) and then a similar-triangle step (\\(\\times\\) its square)."
        };
      } },

    e_pgDH: { shape: "E", src: "2017 P2 Q16",
      pick: function () { var p = ri(1, 4), q = ri(1, 4); return { p: p, q: q, X: (p + q) * q * q * ri(1, 3) }; },
      make: function (P) {
        var p = P.p, q = P.q, X = P.X, w = p + q, AFG = X * q / w, ADH = AFG * w * w / (q * q), DFGH = ADH - AFG, vals = [DFGH, AFG, ADH, X - AFG];
        if (gcd(p, q) !== 1 || !vals.every(isInt) || ADH > 2000) return null;
        var A = [0.3, 0.55], B = [0, 0], C = [1, 0], D = [1.3, 0.55], E = [p / w, 0], F = [1.3 - p / w, 0.55];
        return {
          fig: drawFig({ A: A, B: B, C: C, D: D, E: E, F: F, G: cross(A, C, B, F), H: cross(A, C, D, E) }, [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["A", "C"], ["B", "F"], ["D", "E"]]),
          q: "In the figure, \\(ABCD\\) and \\(BEDF\\) are parallelograms. \\(E\\) is a point lying on \\(BC\\) such that \\(BE : EC = " + p + " : " + q + "\\). \\(AC\\) cuts \\(BF\\) and \\(DE\\) at \\(G\\) and \\(H\\) respectively. If the area of \\(\\triangle ABG\\) is \\(" + X + CM2 + "\\), then the area of the quadrilateral \\(DFGH\\) is",
          opts: vals.map(function (v) { return N(Math.round(v)) + CM2; }),
          sol: "\\(DF = BE\\), so with \\(AD = BC = " + w + "\\) units, \\(AF = " + q + "\\) and \\(AF : BC = " + q + " : " + w + "\\).<br>" +
               "\\(\\triangle AFG \\sim \\triangle CBG\\): \\(FG : GB = " + q + " : " + w + "\\), so \\(\\triangle AFG = " + X + "\\times" + fr(q, w) + " = " + AFG + "\\) (same height as \\(\\triangle ABG\\)).<br>" +
               "\\(FG \\parallel DH\\): \\(\\triangle AFG \\sim \\triangle ADH\\) with \\(AF : AD = " + q + " : " + w + "\\), so \\(DFGH = " + AFG + "\\left[\\left(" + fr(w, q) + "\\right)^2 - 1\\right] = " + N(DFGH) + CM2 + "\\).",
          trap: "\\(DFGH\\) is \\(\\triangle ADH\\) minus \\(\\triangle AFG\\); \\(" + ADH + "\\) is the whole of \\(\\triangle ADH\\)."
        };
      } },

    e_sqXY: { shape: "E", src: "2019 P2 Q16",
      pick: function () { return { a: ri(1, 4), b: ri(2, 8), c: ri(1, 4), Ar: ri(1, 40) }; },
      make: function (P) {
        var a = P.a, b = P.b, c = P.c, Ar = P.Ar, n = a + b + c, m = 2 * a + b + c;
        var BCD = Ar * m / a, BFY = BCD * (a + b) * (a + b) / (n * m), ans = BCD - BFY, vals = [ans, BFY, BCD, ans - Ar];
        if (gcd(gcd(a, b), c) !== 1 || !vals.every(isInt) || vals[3] <= 0 || BCD > 2000) return null;
        var A = [a, b], B = [0, 0], E = [a, 0], F = [a + b, 0], C = [n, 0], D = [a + n, b], G = [a + b, b];
        return {
          fig: drawFig({ A: A, B: B, C: C, D: D, E: E, F: F, G: G, X: cross(B, D, A, E), Y: cross(B, D, F, G) }, [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["A", "E"], ["F", "G"], ["B", "D"]]),
          q: "In the figure, \\(ABCD\\) is a parallelogram and \\(AEFG\\) is a square. It is given that \\(BE : EF : FC = " + a + " : " + b + " : " + c + "\\). \\(BD\\) cuts \\(AE\\) and \\(FG\\) at the points \\(X\\) and \\(Y\\) respectively. If the area of \\(\\triangle ABX\\) is \\(" + Ar + CM2 + "\\), then the area of the quadrilateral \\(CDYF\\) is",
          opts: vals.map(function (v) { return N(Math.round(v)) + CM2; }),
          sol: "In units: \\(BC = AD = " + n + "\\), \\(AG = EF = " + b + "\\) and \\(GD = " + (a + c) + "\\).<br>" +
               "\\(\\triangle BEX \\sim \\triangle DAX\\): \\(BX : XD = " + a + " : " + n + "\\), so \\(\\triangle ABD = " + Ar + "\\times" + fr(m, a) + " = " + BCD + " = \\triangle BCD\\).<br>" +
               "\\(\\triangle BFY \\sim \\triangle DGY\\): \\(FY : YG = " + (a + b) + " : " + (a + c) + "\\). With base \\(BF\\) and height \\(FY\\), \\(\\triangle BFY = " + BCD + "\\times" + fr(a + b, n) + "\\times" + fr(a + b, m) + " = " + BFY + "\\).<br>" +
               "\\(CDYF = " + BCD + " - " + BFY + " = " + N(ans) + CM2 + "\\).",
          trap: "\\(AE\\) and \\(FG\\) are heights of the parallelogram, so \\(\\triangle BFY\\) is half of base \\(BF\\) times height \\(FY\\)."
        };
      } },

    e_pgH: { shape: "E", src: "2020 P2 Q18",
      pick: function () { var a = ri(1, 5), b = ri(1, 6); return { a: a, b: b, X: a * a * (a + 2 * b) * ri(1, 3) }; },
      make: function (P) {
        var a = P.a, b = P.b, X = P.X, w = a + b, ABD = X * w * w / (a * a), CDH = ABD * w / (a + 2 * b), vals = [CDH, ABD, ABD * b / w, CDH * b * b / (w * w)];
        if (gcd(a, b) !== 1 || !vals.every(isInt) || ABD > 2000) return null;
        var A = [0.3, 0.8], B = [0, 0], C = [1, 0], D = [1.3, 0.8], E = [0.3 + a / w, 0.8], F = [-b / w, 0], G = cross(F, E, A, B);
        return {
          fig: drawFig({ A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: cross(B, D, C, G) }, [["C", "F"], ["A", "B"], ["C", "D"], ["D", "A"], ["F", "E"], ["B", "D"], ["C", "G"]]),
          q: "In the figure, \\(ABCD\\) is a parallelogram. Let \\(E\\) be a point lying on \\(AD\\) such that \\(AE : ED = " + a + " : " + b + "\\). \\(CB\\) is produced to the point \\(F\\) such that \\(BF = DE\\). Denote the point of intersection of \\(AB\\) and \\(EF\\) by \\(G\\). It is given that \\(BD\\) and \\(CG\\) intersect at the point \\(H\\). If the area of \\(\\triangle AEG\\) is \\(" + X + CM2 + "\\), then the area of \\(\\triangle CDH\\) is",
          opts: vals.map(function (v) { return N(Math.round(v)) + CM2; }),
          sol: "\\(\\triangle AEG \\sim \\triangle BFG\\) with \\(AE : BF = " + a + " : " + b + "\\), so \\(AG : GB = " + a + " : " + b + "\\) and \\(AG : AB = " + a + " : " + w + "\\).<br>" +
               "Also \\(AE : AD = " + a + " : " + w + "\\), so \\(\\triangle AEG \\sim \\triangle ADB\\): \\(\\triangle ABD = " + X + "\\left(" + fr(w, a) + "\\right)^2 = " + ABD + " = \\triangle BCD\\).<br>" +
               "\\(\\triangle CDH \\sim \\triangle GBH\\): \\(DH : HB = CD : BG = " + w + " : " + b + "\\), so \\(\\triangle CDH = " + ABD + "\\times" + fr(w, a + 2 * b) + " = " + N(CDH) + CM2 + "\\).",
          trap: "\\(DH : HB\\) comes from \\(CD : BG = " + w + " : " + b + "\\), so \\(DH : DB = " + w + " : " + (a + 2 * b) + "\\)."
        };
      } },

    e_four: { shape: "E", src: "2025 P2 Q17",
      pick: function () {
        var a = ri(1, 4), b = ri(1, 4), c = ri(1, 4), d = ri(1, 4), e = ri(1, 3), f = ri(1, 4), kd = e * (a + b) / gcd(b * (e + f), e * (a + b));
        return { a: a, b: b, c: c, d: d, e: e, f: f, X: kd * kd * ri(1, 6) };
      },
      make: function (P) {
        var a = P.a, b = P.b, c = P.c, d = P.d, e = P.e, f = P.f, X = P.X, BE = b / (a + b), CG = e / (e + f);
        if (gcd(a, b) !== 1 || gcd(c, d) !== 1 || gcd(e, f) !== 1 || CG >= 0.85 * BE) return null;
        var k = BE / CG, BEH = X * k * k, BCGE = BEH - X, ABCD = BCGE / ((CG + BE) / 2), AEF = ABCD * (a / (a + b)) * (c / (c + d)) / 2, ans = ABCD - BCGE - AEF;
        var vals = [ans, ABCD - BCGE, ABCD - BEH, BCGE];
        if (!vals.every(isInt) || !vals.every(function (v) { return v > 0; }) || ABCD > 2000) return null;
        vals = vals.map(Math.round);
        var A = [0, 0], B = [1, 0], C = [1.3, 0.55], D = [0.3, 0.55], E = [a / (a + b), 0], F = [0.3 * c / (c + d), 0.55 * c / (c + d)], G = [1.3 - CG, 0.55];
        return {
          fig: drawFig({ A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: cross(E, G, B, C) }, [["A", "B"], ["B", "H"], ["C", "D"], ["D", "A"], ["E", "H"], ["E", "F"]]),
          q: "In the figure, \\(ABCD\\) is a parallelogram. Let \\(E\\), \\(F\\) and \\(G\\) be points lying on \\(AB\\), \\(AD\\) and \\(CD\\) respectively such that \\(AE : EB = " + a + " : " + b + "\\), \\(AF : FD = " + c + " : " + d + "\\) and \\(CG : GD = " + e + " : " + f + "\\). It is given that \\(BC\\) produced and \\(EG\\) produced meet at the point \\(H\\). If the area of \\(\\triangle CGH\\) is \\(" + X + CM2 + "\\), then the area of the quadrilateral \\(DFEG\\) is",
          opts: vals.map(function (v) { return N(v) + CM2; }),
          sol: "As fractions of \\(AB = CD\\): \\(CG = " + fr(e, e + f) + "\\) and \\(BE = " + fr(b, a + b) + "\\), so \\(CG : BE = " + ratio(e * (a + b), b * (e + f)) + "\\).<br>" +
               "\\(\\triangle CGH \\sim \\triangle BEH\\): \\(\\triangle BEH = " + Math.round(BEH) + "\\), so the trapezium \\(BCGE = " + Math.round(BCGE) + "\\).<br>" +
               "\\(BCGE\\) is \\(\\tfrac12\\left(" + fr(e, e + f) + " + " + fr(b, a + b) + "\\right) = " + fr(e * (a + b) + b * (e + f), 2 * (e + f) * (a + b)) + "\\) of \\(ABCD\\), so \\(ABCD = " + Math.round(ABCD) + "\\), and \\(\\triangle AEF = \\tfrac12\\times" + fr(a, a + b) + "\\times" + fr(c, c + d) + "\\times " + Math.round(ABCD) + " = " + Math.round(AEF) + "\\).<br>" +
               "\\(DFEG = " + Math.round(ABCD) + " - " + Math.round(BCGE) + " - " + Math.round(AEF) + " = " + vals[0] + CM2 + "\\).",
          trap: "Take away \\(\\triangle AEF\\) as well as the trapezium \\(BCGE\\)."
        };
      } },

    e_tz: { shape: "E", src: "2026 P2 Q18",
      pick: function () { var p = ri(1, 4), s = ri(1, 4), t = ri(1, 4); return { p: p, q: p + ri(1, 3), s: s, t: t, X: p * (s + t) * (s + t) * ri(1, 4) }; },
      make: function (P) {
        var p = P.p, q = P.q, s = P.s, t = P.t, X = P.X, n = s + t;
        var vals = [(s * p + q * n) * t * X / (p * n * n), (t * p + q * n) * t * X / (p * n * n), (s * p + q * n) * s * X / (p * n * n), q * X / p];
        if (gcd(p, q) !== 1 || gcd(s, t) !== 1 || p >= q || !vals.every(isInt) || vals[3] > 2000) return null;
        var hh = 0.5 * q, off = (q - p) * 0.35, D = [0, 0], C = [q, 0], A = [off, hh], B = [off + p, hh], r = s / n, E = along(B, D, r), F = [E[0] + r * p, E[1]];
        return {
          fig: drawFig({ A: A, B: B, C: C, D: D, E: E, F: F }, [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["B", "D"], ["E", "F"], ["F", "B"], ["F", "C"]]),
          q: "In the figure, \\(ABCD\\) is a trapezium with \\(AB \\parallel DC\\) and \\(AB : CD = " + p + " : " + q + "\\). Let \\(E\\) be a point lying on \\(BD\\) such that \\(BE : ED = " + s + " : " + t + "\\). It is given that \\(AB \\parallel EF\\) and \\(AD \\parallel BF\\). If the area of \\(\\triangle ABD\\) is \\(" + X + CM2 + "\\), then the area of the trapezium \\(CDEF\\) is",
          opts: vals.map(function (v) { return N(v) + CM2; }),
          sol: "Let \\(AB = " + (p === 1 ? "" : p) + "k\\), \\(CD = " + q + "k\\) and \\(h\\) be the height: \\(\\tfrac12(" + (p === 1 ? "" : p) + "k)h = " + X + "\\), so \\(kh = " + fr(2 * X, p) + "\\).<br>" +
               "\\(EF \\parallel AB\\) and \\(BF \\parallel AD\\), so \\(\\triangle EFB \\sim \\triangle BAD\\) with \\(BE : BD = " + s + " : " + n + "\\): \\(EF = " + fr(s * p, n) + "k\\), and \\(E\\) is \\(" + fr(t, n) + "h\\) above \\(DC\\).<br>" +
               "\\(CDEF = \\tfrac12\\left(" + fr(s * p, n) + "k + " + q + "k\\right)\\left(" + fr(t, n) + "h\\right) = " + N(vals[0]) + CM2 + "\\).",
          trap: "\\(EF\\) is \\(" + fr(s, n) + "\\) of \\(AB\\) (from \\(BE : BD\\)), and the height of \\(CDEF\\) is \\(" + fr(t, n) + "h\\) (from \\(ED : BD\\))."
        };
      } }
  };

  function gen(id) {
    var f = forms[id];
    for (var i = 0; i < 20000; i++) {
      var o = f.make(f.pick());
      if (o && distinct(o.opts) && !/NaN|undefined|Infinity/.test(o.q + o.opts.join(""))) { o.id = id; o.shape = f.shape; o.src = f.src; return o; }
    }
    throw new Error("No question found for form " + id);
  }
  function formsOf(shape) { return Object.keys(forms).filter(function (k) { return forms[k].shape === shape; }); }
  window.Drill = { forms: forms, gen: gen };   // for tools/check_drill.js and the console

  /* ---------- Page ---------- */
  var root = typeof document !== "undefined" && document.getElementById("drill");
  if (!root) return;
  var qEl = root.querySelector(".dq"), oEl = root.querySelector(".dopts"), fEl = root.querySelector(".dfeed"),
      sEl = root.querySelector(".dscore"), nextBtn = root.querySelector(".dnext"), mode = "mixed",
      right = 0, tried = 0, streak = 0, best = 0, cur = null, answered = false;
  try { best = +localStorage.getItem("mens-drill-best") || 0; } catch (e) {}

  // \( ... \) to KaTeX
  function tex(el, html) {
    el.innerHTML = html.replace(/\\\((.+?)\\\)/g, function (_, t) { return '<span class="m">' + t.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</span>"; });
    window.TeX && TeX.render(el);
  }
  function score() {
    sEl.textContent = tried ? right + " / " + tried + " correct · streak " + streak + " · best streak " + best : "Best streak so far: " + best;
  }
  function ask() {
    // Mixed draws from every form, so each shape comes up about as often as it does in the papers
    cur = gen(pick(mode === "mixed" ? Object.keys(forms) : formsOf(mode))); answered = false;
    var order = [0, 1, 2, 3].sort(function () { return Math.random() - 0.5; });
    tex(qEl, '<span class="tag">Shape ' + cur.shape + " · twin of " + cur.src + "</span>" + (cur.fig || "") + cur.q);
    oEl.innerHTML = "";
    order.forEach(function (k, i) {
      var b = document.createElement("button");
      b.className = "opt"; b.type = "button";
      tex(b, "<b>" + "ABCD"[i] + "</b>\\(" + cur.opts[k] + "\\)");
      b.onclick = function () { choose(b, k === 0); };
      b.dataset.right = k === 0 ? "1" : "";
      oEl.appendChild(b);
    });
    fEl.hidden = true; nextBtn.hidden = true;
  }
  function choose(b, ok) {
    if (answered) return;
    answered = true; tried++;
    if (ok) { right++; streak++; if (streak > best) { best = streak; try { localStorage.setItem("mens-drill-best", best); } catch (e) {} } }
    else streak = 0;
    oEl.querySelectorAll(".opt").forEach(function (o) {
      o.disabled = true;
      if (o.dataset.right) o.classList.add("right");
    });
    if (!ok) b.classList.add("wrong");
    tex(fEl, "<strong>" + (ok ? "Correct." : "Not this time.") + "</strong> " + cur.sol + (ok ? "" : '<br><span class="trapline">' + cur.trap + "</span>"));
    fEl.hidden = false; nextBtn.hidden = false; nextBtn.focus();
    score();
  }
  root.querySelectorAll(".dmode button").forEach(function (b) {
    b.onclick = function () {
      mode = b.dataset.mode;
      root.querySelectorAll(".dmode button").forEach(function (o) { o.classList.toggle("on", o === b); });
      ask();
    };
  });
  nextBtn.onclick = ask;
  score(); ask();
})();
