// Loaded only on pages with `[extra] mermaid = true`.
// Turns ```mermaid fenced code blocks into diagrams; without JS they stay readable source.
for (const code of document.querySelectorAll('pre > code[data-lang="mermaid"]')) {
  const div = document.createElement("div");
  div.className = "mermaid";
  div.textContent = code.textContent;
  code.parentElement.replaceWith(div);
}
mermaid.initialize({
  startOnLoad: false,
  theme: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "neutral",
});
mermaid.run();
