/* Paper 2 MC drill: endless randomised twins of the five DSE Mensuration shapes (A to E).
   Every question is built from integers, so the correct option is exact (pi and surds kept as symbols). */
(function () {
  "use strict";
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function distinct(list) {
    for (var i = 0; i < list.length; i++) for (var j = i + 1; j < list.length; j++) if (list[i] === list[j]) return false;
    return true;
  }
  function pi(c) { return c === 1 ? "\\pi" : c + "\\pi"; }             // 12 -> 12\pi
  function ratio(a, b) { var g = gcd(a, b); return a / g + " : " + b / g; }
  var CM = "\\text{ cm}", CM2 = "\\text{ cm}^2", CM3 = "\\text{ cm}^3";

  /* ---------- Small figures (SVG strings; not drawn to scale, as in the DSE) ---------- */
  var S = 'stroke="#231f20" stroke-width="2" fill="none"';
  function lab(x, y, t) { return '<text x="' + x + '" y="' + y + '" font-size="16" font-style="italic" text-anchor="middle">' + t + "</text>"; }
  function fig(w, h, body) { return '<svg class="dfig" viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="Figure">' + body + "</svg>"; }

  /* ---------- The five shapes ---------- */
  var shapes = {
    /* A: sector. Three real forms: arc and area give the angle (2024); perimeter k and area mk (2026); radius and area give the perimeter (2015). */
    A: function () {
      var angles = [30, 36, 40, 45, 60, 72, 80, 90, 108, 120, 135, 144, 150];
      var form = pick([1, 2, 3]);
      for (;;) {
        if (form === 1) {
          var th = pick(angles), r = ri(5, 30);
          if ((th * r) % 180 || (th * r * r) % 360) continue;
          var l = th * r / 180, A = th * r * r / 360;
          var others = angles.filter(function (a) { return a !== th; }).sort(function () { return Math.random() - 0.5; }).slice(0, 3);
          return {
            shape: "A",
            q: "If the arc length and the area of a sector are \\(" + pi(l) + CM + "\\) and \\(" + pi(A) + CM2 + "\\) respectively, then the angle of the sector is",
            opts: [th + "^\\circ"].concat(others.map(function (a) { return a + "^\\circ"; })),
            sol: "Area \\(= \\tfrac12 r\\ell\\): \\(" + pi(A) + " = \\tfrac12 r(" + pi(l) + ")\\), so \\(r = " + r + "\\).<br>" +
                 "Arc: \\(2\\pi(" + r + ")\\times\\dfrac{\\theta}{360^\\circ} = " + pi(l) + "\\), so \\(\\theta = " + th + "^\\circ\\).",
            trap: "Find the radius first with area \\(= \\tfrac12 r\\ell\\); it saves solving two equations."
          };
        }
        if (form === 2) {
          var m = ri(1, 4), r2 = ri(6, 30);
          if (r2 <= 2 * m || (4 * m * r2) % (r2 - 2 * m)) continue;
          var l2 = 4 * m * r2 / (r2 - 2 * m);
          if (l2 >= 2 * Math.PI * r2 || l2 === r2 || 2 * l2 === 2 * r2 + l2) continue;
          var k = 2 * r2 + l2, opts2 = [l2, k, 2 * l2, r2];
          if (!distinct(opts2)) continue;
          return {
            shape: "A",
            q: "The perimeter and the area of a sector are \\(k" + CM + "\\) and \\(" + (m === 1 ? "" : m) + "k" + CM2 + "\\) respectively. If the radius of the sector is \\(" + r2 + CM + "\\), then the arc length of the sector is",
            opts: opts2.map(function (v) { return v + CM; }),
            sol: "Let the arc be \\(\\ell\\). Area \\(= \\tfrac12(" + r2 + ")\\ell = " + (m === 1 ? "" : m) + "k\\), so \\(k = \\dfrac{" + r2 + "\\ell}{" + 2 * m + "}\\).<br>" +
                 "Perimeter \\(= " + 2 * r2 + " + \\ell = k\\). Solving, \\(\\ell = " + l2 + "\\).",
            trap: "\\(" + k + "\\) is \\(k\\), the perimeter. The perimeter is the arc plus two radii."
          };
        }
        var th3 = pick(angles), r3 = ri(4, 24);
        if ((th3 * r3) % 180 || (th3 * r3 * r3) % 360) continue;
        var c = th3 * r3 / 180, A3 = th3 * r3 * r3 / 360;
        var opts3 = [pi(c) + " + " + 2 * r3, pi(c), pi(c) + " + " + r3, pi(2 * c) + " + " + 2 * r3];
        return {
          shape: "A",
          q: "The radius and the area of a sector are \\(" + r3 + CM + "\\) and \\(" + pi(A3) + CM2 + "\\) respectively. The perimeter of the sector is",
          opts: opts3.map(function (t) { return "(" + t + ")" + CM; }),
          sol: "\\(\\dfrac{\\theta}{360^\\circ}\\pi(" + r3 + "^2) = " + pi(A3) + "\\), so \\(\\theta = " + th3 + "^\\circ\\). Arc \\(= \\dfrac{" + th3 + "}{360}(2\\pi)(" + r3 + ") = " + pi(c) + "\\).<br>" +
               "Perimeter \\(= " + pi(c) + " + 2(" + r3 + ") = (" + pi(c) + " + " + 2 * r3 + ")" + CM + "\\).",
          trap: "The perimeter of a sector is the arc plus <strong>two</strong> radii."
        };
      }
    },

    /* B: segment cut off by a chord that subtends 60, 90 or 120 degrees (exact answers, as in 2012 P2 Q21). */
    B: function () {
      for (;;) {
        var th = pick([60, 90, 120]), r = th === 90 ? pick([4, 6, 8, 10, 12]) : pick([6, 12]);
        var s = th * r * r / 360, t = th === 90 ? r * r / 2 : r * r / 4, u = th === 90 ? "" : "\\sqrt{3}";
        var major = Math.random() < 0.5, whole = r * r;
        var chord = th === 60 ? r + CM : th === 90 ? r + "\\sqrt{2}" + CM : r + "\\sqrt{3}" + CM;
        function e(a, sign, b) { return "\\left(" + pi(a) + " " + sign + " " + b + u + "\\right)" + CM2; }
        var right = major ? e(whole - s, "+", t) : e(s, "-", t);
        var opts = major ? [right, e(whole - s, "-", t), e(s, "-", t), e(whole - s, "+", 2 * t)]
                         : [right, e(s, "+", t), e(whole - s, "+", t), e(s, "-", 2 * t)];
        if (!distinct(opts)) continue;
        return {
          shape: "B",
          q: "\\(AB\\) is a chord of a circle with centre \\(O\\) and radius \\(" + r + CM + "\\). If \\(AB = " + chord + "\\), find the area of the " + (major ? "major" : "minor") + " segment cut off by \\(AB\\).",
          opts: opts,
          sol: "\\(OA = OB = " + r + "\\) and \\(AB = " + chord.replace(CM, "") + "\\), so \\(\\angle AOB = " + th + "^\\circ\\)" + (th === 60 ? " (an equilateral triangle)" : th === 90 ? " (Pythagoras)" : " (cosine formula)") + ".<br>" +
               "Minor segment \\(= \\dfrac{" + th + "}{360}\\pi(" + r + "^2) - \\tfrac12(" + r + "^2)\\sin " + th + "^\\circ = " + pi(s) + " - " + t + u + "\\)." +
               (major ? "<br>Major segment \\(= \\pi(" + r + "^2) - (" + pi(s) + " - " + t + u + ") = " + pi(whole - s) + " + " + t + u + "\\)." : ""),
          trap: "Segment = sector <strong>minus</strong> triangle; the major segment is the circle minus the minor one."
        };
      }
    },

    /* C: frustum of a cone (2015) or of a square pyramid (2026): V(1 - k^3), k measured from the vertex. */
    C: function () {
      for (;;) {
        var kn = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]), d = kn[1], n = kn[0];
        var h = d * ri(2, 6), small = h * n / d, f = h - small;
        var cone = Math.random() < 0.6, a = cone ? ri(2, 15) : 2 * ri(3, 12);
        var whole3 = a * a * h;                     // 3 x volume (times pi for the cone)
        if (whole3 % 3) continue;
        var V = whole3 / 3;
        if ((V * (d * d * d - n * n * n)) % (d * d * d) || (V * n * n * n) % (d * d * d) || (V * (d * d - n * n)) % (d * d) || (V * (d - n)) % d) continue;
        var Y = V * (d * d * d - n * n * n) / (d * d * d), X = V * n * n * n / (d * d * d), W2 = V * (d * d - n * n) / (d * d), W1 = V * (d - n) / d;
        var vals = [Y, X, W2, W1];
        if (!distinct(vals)) continue;
        var fmt = function (v) { return (cone ? pi(v) : String(v)) + CM3; };
        return {
          shape: "C",
          q: cone
            ? "The height and the base radius of a right circular cone are \\(" + h + CM + "\\) and \\(" + a + CM + "\\) respectively. A frustum is made by cutting off the upper part of the cone by a plane parallel to its base. If the height of the frustum is \\(" + f + CM + "\\), find the volume of the frustum."
            : "The base of a right pyramid is a square of side \\(" + a + CM + "\\) and its height is \\(" + h + CM + "\\). The pyramid is divided into a small pyramid and a frustum by a plane parallel to its base. If the height of the frustum is \\(" + f + CM + "\\), find the volume of the frustum.",
          opts: vals.map(fmt),
          sol: "Whole: \\(\\tfrac13" + (cone ? "\\pi" : "") + "(" + a + "^2)(" + h + ") = " + fmt(V).replace(CM3, "") + "\\). The part cut off has height \\(" + h + " - " + f + " = " + small + "\\), so \\(k = \\tfrac{" + small + "}{" + h + "} = \\tfrac{" + n + "}{" + d + "}\\).<br>" +
               "Frustum \\(= " + fmt(V).replace(CM3, "") + "\\left[1 - \\left(\\tfrac{" + n + "}{" + d + "}\\right)^3\\right] = " + fmt(Y) + "\\).",
          trap: "\\(k\\) compares heights measured from the vertex (\\(" + small + "\\) out of \\(" + h + "\\)), and volumes go with \\(k^3\\), not \\(k^2\\)."
        };
      }
    },

    /* D: two solids in letters (2017, 2020): find the block pi a^2 b, never a and b themselves. */
    D: function () {
      for (;;) {
        var p = ri(2, 6), q = ri(2, 7), s = ri(2, 7), t = ri(2, 7), B = ri(1, 9);
        if (p === s && q === t) continue;
        var cyl = p * p * q * B, cone3 = s * s * t * B;
        if (cone3 % 3 || cyl > 2000) continue;
        var cone = cone3 / 3, swap3 = t * t * s * B;
        if (swap3 % 3) continue;
        var opts = [cone, cone3, swap3 / 3, cyl];
        if (!distinct(opts)) continue;
        function c(v, l) { return (v === 1 ? "" : v) + l; }
        return {
          shape: "D",
          q: "If the volume of a right circular cylinder of base radius \\(" + c(p, "a") + CM + "\\) and height \\(" + c(q, "b") + CM + "\\) is \\(" + cyl + CM3 + "\\), then the volume of a right circular cone of base radius \\(" + c(s, "a") + CM + "\\) and height \\(" + c(t, "b") + CM + "\\) is",
          opts: opts.map(function (v) { return v + CM3; }),
          sol: "Cylinder: \\(\\pi(" + c(p, "a") + ")^2(" + c(q, "b") + ") = " + p * p * q + "\\pi a^2 b = " + cyl + "\\), so \\(\\pi a^2 b = " + B + "\\).<br>" +
               "Cone: \\(\\tfrac13\\pi(" + c(s, "a") + ")^2(" + c(t, "b") + ") = \\dfrac{" + s * s * t + "}{3}\\pi a^2 b = " + cone + "\\).",
          trap: "\\(" + cone3 + "\\) forgets the \\(\\tfrac13\\); you never need \\(a\\) or \\(b\\) on their own."
        };
      }
    },

    /* E: area ratios: parallel lines in a triangle (2020 Q17) or a parallelogram with a diagonal (2018 Q16). */
    E: function () {
      for (;;) {
        if (Math.random() < 0.5) {
          var a = ri(1, 3), b = ri(1, 3), c = ri(1, 3);
          var A1 = (a + b) * (a + b) - a * a, A2 = (a + b + c) * (a + b + c) - (a + b) * (a + b);
          var opts = [ratio(A1, A2), ratio(b * b, c * c), ratio(b, c), ratio((a + b) * (a + b), (a + b + c) * (a + b + c))];
          if (!distinct(opts)) continue;
          var L = 300, y0 = 150, xs = [a, a + b, a + b + c].map(function (v) { return 30 + v / (a + b + c) * L; });
          var svg = '<polygon points="30,' + y0 + " " + xs[2] + "," + y0 + " " + (xs[2] - 40) + ',20" ' + S + "/>";
          xs.slice(0, 2).forEach(function (x) { var f = (x - 30) / L; svg += '<line x1="' + x + '" y1="' + y0 + '" x2="' + (30 + f * (L - 40)) + '" y2="' + (y0 - f * 130) + '" ' + S + "/>"; });
          var figure = fig(360, 175, svg + lab(22, y0 + 18, "O") + lab(xs[0], y0 + 20, "P") + lab(xs[1], y0 + 20, "Q") + lab(xs[2], y0 + 20, "R") +
                       lab(30 + (xs[0] - 30) / L * (L - 40) - 10, y0 - (xs[0] - 30) / L * 130 - 4, "U") + lab(30 + (xs[1] - 30) / L * (L - 40) - 10, y0 - (xs[1] - 30) / L * 130 - 4, "T") + lab(xs[2] - 40, 14, "S"));
          return {
            shape: "E", fig: figure,
            q: "In the figure, \\(P\\) and \\(Q\\) lie on \\(OR\\), and \\(U\\) and \\(T\\) lie on \\(OS\\), such that \\(OP : PQ : QR = " + a + " : " + b + " : " + c + "\\) and \\(PU \\parallel QT \\parallel RS\\). The ratio of the area of the trapezium \\(PQTU\\) to the area of the trapezium \\(QRST\\) is",
            opts: opts,
            sol: "\\(OP : OQ : OR = " + a + " : " + (a + b) + " : " + (a + b + c) + "\\), and the three triangles at \\(O\\) are similar, so their areas are \\(" + a * a + " : " + (a + b) * (a + b) + " : " + (a + b + c) * (a + b + c) + "\\).<br>" +
                 "\\(PQTU : QRST = (" + (a + b) * (a + b) + " - " + a * a + ") : (" + (a + b + c) * (a + b + c) + " - " + (a + b) * (a + b) + ") = " + opts[0] + "\\).",
            trap: "Square the distances <strong>from \\(O\\)</strong>, then subtract. Squaring \\(PQ : QR\\) gives \\(" + opts[1] + "\\)."
          };
        }
        var m = ri(1, 5), n = ri(1, 5), Xmul = ri(1, 4);
        if (gcd(m, n) !== 1) continue;
        var X = Xmul * m * (m + n), BFE = X * m / (m + n), DFA = X * (m + n) / m, ABD = X + DFA, ans = ABD - BFE;
        var opts2 = [ans, ABD, DFA, ABD + BFE].map(function (v) { return v + CM2; });
        if (!distinct(opts2) || ans > 2000) continue;
        var ex = 30 + m / (m + n) * 250, ff = m / (2 * m + n);   // F divides BD with BF : FD = m : (m + n)
        var fx = 30 + ff * 300, fy = 150 - ff * 120;
        var p2 = '<polygon points="30,150 280,150 330,30 80,30" ' + S + '/><line x1="80" y1="30" x2="' + ex + '" y2="150" ' + S + '/><line x1="30" y1="150" x2="330" y2="30" ' + S + "/>";
        var figure2 = fig(360, 175, p2 + lab(72, 22, "A") + lab(22, 166, "B") + lab(288, 166, "C") + lab(338, 24, "D") + lab(ex, 168, "E") + lab(fx + 6, fy + 20, "F"));
        return {
          shape: "E", fig: figure2,
          q: "In the figure, \\(ABCD\\) is a parallelogram. \\(E\\) is a point lying on \\(BC\\) such that \\(BE : EC = " + m + " : " + n + "\\). \\(AE\\) and \\(BD\\) intersect at \\(F\\). If the area of \\(\\triangle ABF\\) is \\(" + X + CM2 + "\\), then the area of the quadrilateral \\(CDFE\\) is",
          opts: opts2,
          sol: "\\(\\triangle BFE \\sim \\triangle DFA\\) with \\(BE : DA = " + m + " : " + (m + n) + "\\), so \\(EF : FA = BF : FD = " + m + " : " + (m + n) + "\\).<br>" +
               "Same height: \\(\\triangle BFE = " + BFE + "\\) and \\(\\triangle DFA = " + DFA + "\\). Then \\(\\triangle BCD = \\triangle ABD = " + X + " + " + DFA + " = " + ABD + "\\).<br>" +
               "\\(CDFE = " + ABD + " - " + BFE + " = " + ans + CM2 + "\\).",
          trap: "\\(BE : DA\\) is \\(" + m + " : " + (m + n) + "\\), not \\(" + m + " : " + n + "\\): \\(AD = BC = BE + EC\\)."
        };
      }
    }
  };

  /* ---------- Page ---------- */
  var root = document.getElementById("drill");
  if (!root) { window.Drill = { shapes: shapes }; return; }
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
    var key = mode === "mixed" ? pick(["A", "B", "C", "D", "E"]) : mode;
    cur = shapes[key](); answered = false;
    var order = [0, 1, 2, 3].sort(function () { return Math.random() - 0.5; });
    tex(qEl, '<span class="tag">Shape ' + cur.shape + "</span>" + (cur.fig || "") + cur.q);
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
  window.Drill = { shapes: shapes };   // for checking in the console
})();
