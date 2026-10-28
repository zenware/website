// Loaded only on pages with `[extra] math = true`. Renders $inline$ and $$display$$ TeX.
renderMathInElement(document.querySelector("main"), {
  delimiters: [
    { left: "$$", right: "$$", display: true },
    { left: "$", right: "$", display: false },
  ],
  throwOnError: false,
});
