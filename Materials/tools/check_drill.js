// Runs every drill shape many times: options distinct, no NaN, and for C and D the correct option
// re-derived independently from the numbers in the question. Run: node tools/check_drill.js
global.window = {}; global.document = { getElementById: function () { return null; } };
require("../site/js/drill.js");
var shapes = window.Drill.shapes, n = 0;
function num(s) { return +String(s).match(/-?\d+/)[0]; }
function coef(txt, letter) { var m = txt.match(new RegExp("(\\d*)" + letter + "\\\\text")); return m[1] === "" ? 1 : +m[1]; }
Object.keys(shapes).forEach(function (k) {
  for (var i = 0; i < 3000; i++) {
    var q = shapes[k]();
    if (new Set(q.opts).size !== 4) throw new Error(k + " options not distinct: " + q.opts);
    if (!q.q || !q.sol || !q.trap) throw new Error(k + " missing text");
    if (/NaN|undefined|Infinity/.test(q.q + q.sol + q.opts.join())) throw new Error(k + " bad value: " + q.q);
    var d = (q.q.match(/\d+/g) || []).map(Number);   // the integers in the question, in order
    if (k === "C") {   // frustum = whole - small part
      var cone = /cone/.test(q.q), h = cone ? d[0] : d[1], a = cone ? d[1] : d[0], f = d[2];
      var V = a * a * h / 3, want = V - V * Math.pow((h - f) / h, 3);
      if (Math.abs(num(q.opts[0]) - want) > 1e-9) throw new Error("C wrong: " + q.q + " " + q.opts[0] + " vs " + want);
    }
    if (k === "D") {
      var parts = q.q.split("volume of a right circular cone");
      var cyl = +parts[0].match(/is \D*(\d+)\\text\{ cm\}\^3/)[1];
      var want2 = Math.pow(coef(parts[1], "a"), 2) * coef(parts[1], "b") * cyl / (Math.pow(coef(parts[0], "a"), 2) * coef(parts[0], "b")) / 3;
      if (Math.abs(num(q.opts[0]) - want2) > 1e-9) throw new Error("D wrong " + q.q + " " + q.opts[0] + " vs " + want2);
    }
    n++;
  }
});
console.log("drill ok:", n, "questions generated and checked");
