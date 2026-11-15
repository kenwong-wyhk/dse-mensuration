/* Renders maths written as <span class="m">TeX</span> (inline) and <div class="md">TeX</div> (display).
   KaTeX is loaded from vendor/katex, so the pages work without an internet connection. */
(function () {
  var macros = { "\\f": "\\mathrm{f}", "\\g": "\\mathrm{g}", "\\h": "\\mathrm{h}", "\\p": "\\mathrm{p}", "\\q": "\\mathrm{q}", "\\F": "\\mathrm{F}" };
  function render(root) {
    if (!window.katex) return;
    (root || document).querySelectorAll(".m, .md").forEach(function (el) {
      if (el.dataset.tex === undefined) el.dataset.tex = el.textContent;
      katex.render(el.dataset.tex, el, { displayMode: el.classList.contains("md"), throwOnError: false, macros: macros });
    });
  }
  window.TeX = { render: render, macros: macros };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { render(); });
  else render();
})();
