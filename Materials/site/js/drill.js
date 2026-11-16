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
  /* Label a crossing point P: try the middle of each gap between the lines through P (ends = their far ends) and
     keep the spot furthest from every line of the figure (segs), so the letter never sits on a line. */
  function labX(P, ends, segs, t) {
    var a = ends.map(function (E) { return Math.atan2(E[1] - P[1], E[0] - P[0]); }).sort(function (u, v) { return u - v; }), best = null, room = -1;
    a.forEach(function (u, i) {
      var v = i + 1 < a.length ? a[i + 1] : a[0] + 2 * Math.PI, m = (u + v) / 2, C = [P[0] + 16 * Math.cos(m), P[1] + 16 * Math.sin(m)];
      var r = Math.min.apply(null, segs.map(function (s) { return dseg(C, s[0], s[1]); }));
      if (r > room) { room = r; best = C; }
    });
    return lab(best[0], best[1] + 5.5, t);
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
        var names = { "1": "I only", "2": "II only", "3": "III only", "12": "I and II only", "13": "I and III only", "23": "II and III only", "123": "I, II and III" };
        var key = (t[0] ? "1" : "") + (t[1] ? "2" : "") + (t[2] ? "3" : "");
        var others = shuffled(Object.keys(names).filter(function (k) { return k !== key; })).slice(0, 3);
        var yes = function (b) { return b ? "true" : "false"; };
        return {
          fig: figSectors(true),
          q: "In the figure, \\(OAB\\) and \\(OCD\\) are sectors with centre \\(O\\), where \\(OA = " + a + CM + "\\) and \\(OC = " + c + CM + "\\). The area of the shaded region \\(ABDC\\) is \\(" + pi(shade) + CM2 + "\\). Which of the following is/are true?" +
             "<br>I. The angle of the sector \\(OAB\\) is \\(" + (t[0] ? th : wrongTh) + "^\\circ\\)." +
             "<br>II. The area of the sector \\(OAB\\) is \\(" + pi(t[1] ? inner : falseII) + CM2 + "\\)." +
             "<br>III. The perimeter of the sector \\(OCD\\) is \\(" + (t[2] ? "(" + pi(arc) + " + " + 2 * c + ")" : pi(arc)) + CM + "\\).",
          opts: [key].concat(others).map(function (k) { return T(names[k]); }),
          sol: "\\(\\dfrac{\\theta}{360^\\circ}\\pi(" + c + "^2 - " + a + "^2) = " + pi(shade) + "\\), so \\(\\theta = " + th + "^\\circ\\). I is " + yes(t[0]) + ".<br>" +
               "Sector \\(OAB = \\dfrac{" + th + "}{360}\\pi(" + a + "^2) = " + fr(a * a * th, 360) + "\\pi\\). II is " + yes(t[1]) + ".<br>" +
               "Perimeter of \\(OCD = 2(" + c + ") + \\dfrac{" + th + "}{360}(2\\pi)(" + c + ") = " + 2 * c + " + " + pi(arc) + "\\). III is " + yes(t[2]) + ".",
          trap: "Test each statement on its own. The perimeter of a sector includes both radii; sector \\(OAB\\) is not the shaded region."
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
    var shape = mode === "mixed" ? pick(["A", "B", "C", "D", "E"]) : mode;
    cur = gen(pick(formsOf(shape))); answered = false;
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
