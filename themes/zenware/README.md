# zenware

A Zola theme that is **as simple as it can possibly be, and just complex enough
to actually work.** It's built for one site ([jaylooney.dev](https://www.jaylooney.dev)),
with heavy inspiration from
[motherfuckingwebsite.com](https://motherfuckingwebsite.com/) and its
[brethren](https://modernmotherfuckingwebsite.dreamstation.systems/).

- One stylesheet of about 3 KB (about 1.4 KB gzipped). No webfonts, no JavaScript, no shortcodes.
- Light and dark mode follow the OS (`prefers-color-scheme`).
- Syntax highlighting uses Catppuccin (Latte for light, Mocha for dark), contrast-checked.
- Math (KaTeX) and diagrams (Mermaid) are self-hosted and load only on pages that opt in.
- Goals: 100s across Lighthouse, a top YellowLabTools grade, and an A+ on MDN Observatory.

## Usage

```toml
# config.toml
theme = "zenware"

[markdown.highlighting]
code = true
style = "class"            # required: tokens are styled by the theme, never inline
theme = "catppuccin-mocha" # zola requires one; the generated giallo.css is not used

[extra]
author = "Jay Looney"
title_addition = "Software Engineer"   # appended to the home page <title>
menu = [{url = "about/", name = "About"}]
menu_footer = [{url = "privacy/", name = "Privacy"}]
mail = "you@example.com"
github = "user"
linkedin = "user"
twitter = "user"
head_extra = '<script type="application/ld+json">…</script>'   # optional raw <head> HTML
```

Section `[extra] cta = "markdown"` on the root `_index.md` puts a line above
the post list.

### Opt-in per page

```toml
[extra]
math = true      # $inline$ and $$display$$ TeX via KaTeX
mermaid = true   # ```mermaid fenced code blocks become diagrams
```

Both libraries need inline styles, so each opt-in page also needs a relaxed CSP
block in `static/_headers` (see `/theme-demo/` there). Without JS, the TeX and
the Mermaid source stay readable as text. For a diagram that never changes, a
`text` code block or an SVG image is lighter than Mermaid. Mermaid is about 5 MB.

### Templates

`base`, `index` (paginated home), `page` (`pages` is an alias), `section`,
`archive` (posts grouped by year), `taxonomy_list`, `taxonomy_single`, `404`,
plus one macro in `macros.html`.

### Checking contrast

```sh
python3 themes/zenware/scripts/check-contrast.py
```

This parses `sass/style.scss` and checks every text/background pair in both color
schemes against the targets below (WCAG 2 ratio and APCA Lc). It exits non-zero
on failure, so it can run in CI.

### Vendored files

`static/vendor/` holds unmodified upstream builds (versions in `VERSIONS`,
licenses next to each). To update:
`npm pack katex mermaid`, then copy `katex.min.{js,css}`, `contrib/auto-render.min.js`,
`fonts/*.woff2` and `mermaid.min.js`.

## Design decisions

Each choice is based on research or a standard where one exists, and on taste
where none does. When a source is superseded, update its row and the matching
value in `sass/style.scss`.

| Decision | Value | Basis |
|---|---|---|
| Body size | `font-size: 112.5%` on `html` (18px at the browser default). Everything else is in `em`/`rem`, so user font settings and zoom still apply. | Rello, Pielot & Marcos, "Make It Big! The Effect of Font Size and Line Spacing on Online Readability," *CHI 2016*, [doi:10.1145/2858036.2858204](https://doi.org/10.1145/2858036.2858204): readability and comprehension improved up to about 18pt. Lighthouse's "legible font sizes" audit fails below 12px. WCAG 2.2 SC 1.4.4 (Resize Text). |
| Line length | `max-width: 62ch`, one column. With proportional fonts that comes to about 65–75 characters per line. | Bringhurst, *The Elements of Typographic Style*, §2.1.2: 45–75 characters, 66 ideal. Dyson & Haselgrove, "The influence of reading speed and line length on the effectiveness of reading from screen," *IJHCS* 54(4), 2001, [doi:10.1006/ijhc.2001.0458](https://doi.org/10.1006/ijhc.2001.0458): about 55 cpl gave the best comprehension. |
| Line height | `1.5` for body text, `1.2` for headings | WCAG 2.2 SC 1.4.12 (Text Spacing) requires layouts to survive 1.5. W3C [C21](https://www.w3.org/WAI/WCAG22/Techniques/css/C21). Rello et al. 2016 found line spacing had little effect, so 1.5 is the floor rather than a bigger number. |
| Paragraph spacing | Browser default `1em` margins | No study beats the default. WCAG 1.4.12 only requires that 2× still works. |
| Contrast (prose) | At least 7:1 (WCAG AAA) **and** APCA \|Lc\| ≥ 75 for body, link, visited, and muted text in both schemes | WCAG 2.2 SC 1.4.6 (Contrast Enhanced). [APCA](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell) (WCAG 3 candidate): Lc 75 is the minimum for body text, Lc 90 preferred. Body text reaches about Lc 90 in both schemes. Checked by `scripts/check-contrast.py`. |
| Contrast (code) | At least 4.5:1 (AA) for every syntax token | WCAG 2.2 SC 1.4.3. Stock Catppuccin Latte fails this (green is about 3:1, yellow about 2.3:1), so the light token hues are darkened. Mocha passes as shipped. |
| Pure black on white | Avoided: `#1c1c1f` on `#fdfdfc` | **Taste, not evidence.** Claims that pure black on white causes eye strain or halation are mostly anecdotal. The contrast is still about 16.7:1. |
| Font family | System stacks only. Body: `system-ui` (sans). Headings and site title: Charter / Sitka / Cambria (serif, from [modernfontstacks.com](https://modernfontstacks.com/)). Code: `ui-monospace` stack. | Wallace et al., "Towards Individuated Reading Experiences: Different Fonts Increase Reading Speed for Different Individuals," *ACM TOCHI* 29(4), 2022, [doi:10.1145/3502222](https://doi.org/10.1145/3502222): no single font is best, so use what readers already know. Arditi & Cho, "Serifs and font legibility," *Vision Research* 45, 2005, [doi:10.1016/j.visres.2005.06.013](https://doi.org/10.1016/j.visres.2005.06.013): serifs make no meaningful difference. System fonts also cost zero bytes and no layout shift. |
| Serif headings, sans body | Chosen after trying all three stacks for the whole page | **Taste and convention, not evidence.** Since serifs don't measurably change legibility (Arditi & Cho 2005), the pairing is only about the look of the page and making headings stand apart from body text. I know of no study showing a mixed pairing reads better than a single family. |
| Monospace body | Tried and rejected: it felt the most "me", but 62ch sits wrong with it and it's a poor default for readers | Mansfield, Legge & Bane, "Psychophysics of reading XV: Font effects in normal and low vision," *IOVS* 37(8), 1996: fixed-pitch text helps only near the acuity limit. At normal sizes proportional text reads as fast or faster. |
| Code font size | `0.875em` | Monospace glyphs look larger than proportional ones at the same size. This is optical matching, so it's taste. |
| Alignment | Left-aligned, ragged right, no justification, no hyphenation | British Dyslexia Association, *Dyslexia Style Guide* (2023). WCAG 2.2 SC 1.4.8, [Visual Presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html): text is not justified, because uneven word spacing creates "rivers". |
| Links | Always underlined. Visited links are a different color. | WCAG 2.2 SC 1.4.1 (Use of Color). Nielsen Norman Group, ["Guidelines for Visualizing Links"](https://www.nngroup.com/articles/guidelines-for-visualizing-links/) (2004, still current). |
| Link colors | Unvisited: blue (the browser convention). Visited: Baker-Miller pink (`#ff91af`), lightened to `#ffbfd1` in dark mode and deepened to `#953253` in light mode to meet the targets above. Header and footer links never show the visited color. | Blue is **convention** (Jakob's Law: users expect what other sites do). Pink instead of purple is **taste**. Pure Baker-Miller pink is only 2.1:1 on the light background and APCA Lc 59 on the dark one, so it fails as text. Site navigation isn't something you "have read", so marking it visited is noise. |
| Tap targets | Nav and footer links use the 27px line box (18 × 1.5) with `1em` gaps | WCAG 2.2 SC 2.5.8 (Target Size Minimum: 24×24 CSS px). Lighthouse "tap targets" audit. |
| Color scheme | `prefers-color-scheme` only, with `color-scheme: light dark`, so form controls and scrollbars match too. No toggle. | A toggle requires JS and storage. The OS setting already expresses the reader's choice ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)). Revisit if a toggle turns out to be wanted. |
| Motion | None. Smooth scrolling only when `prefers-reduced-motion: no-preference`. | WCAG 2.2 SC 2.3.3 (Animation from Interactions). |
| Reflow | Single column, `overflow-wrap: break-word`. Code blocks scroll horizontally. | WCAG 2.2 SC 1.4.10 (Reflow at 320px). Code is explicitly exempt from reflow. |
| Landmarks | `header`, `nav`, `main`, `footer`. One `h1` per page. No skip link. | WCAG 2.4.1 (Bypass Blocks) is met by landmarks ([ARIA11](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA11)). With a three-link nav, a skip link adds markup for almost no gain. |
| JavaScript | None by default. KaTeX and Mermaid are opt-in per page and self-hosted. | Wesley Aptekar-Cassels, ["Why not use a JavaScript CDN"](https://blog.wesleyac.com/posts/why-not-javascript-cdn): shared-cache benefits are gone (cache partitioning), and third-party hosts add risk. Self-hosting also keeps the CSP to `'self'`. |
| CSS delivery | One external, cache-busted file (`get_url(…, cachebust=true)`), no `!important`, no vendor prefixes except `-webkit-text-size-adjust` | Lighthouse render-blocking audit (one small file is negligible). [YellowLabTools](https://yellowlab.tools/) rules on CSS complexity, duplicated selectors, and old prefixes. External rather than inline, so CSP needs no hashes. |
| Syntax highlighting | `style = "class"`. The theme styles giallo's `z-*` classes itself. | No inline `style=""`, so `style-src 'self'` holds. One token palette instead of two generated files, which means fewer requests and no duplicated selectors. Zola docs: [syntax highlighting](https://www.getzola.org/documentation/content/syntax-highlighting/). |
| Security headers | Strict CSP (`default-src 'none'`), HSTS, nosniff, `frame-ancestors 'none'`, COOP, Referrer-Policy, Permissions-Policy, all in `static/_headers` | [MDN Observatory scoring](https://developer.mozilla.org/en-US/observatory/docs/tests_and_scoring). Cloudflare Pages [`_headers`](https://developers.cloudflare.com/pages/configuration/headers/). |

## Roadmap

These were left out of the first version to keep it minimal. People do like
them, so each is a candidate to add when it earns its place.

- **Reading time**: "· 7 min read" in post metadata. Zola already provides
  `page.reading_time`, so this is one line in `page.html` and `index.html`.
- **Table of contents**: opt-in per page (`[extra] toc = true`), rendered from
  `page.toc` as a nested `<ol>` of anchor links. Only worth it on long posts.
- **Previous/next post links**: "← Newer / Older →" at the bottom of a post, using
  `page.higher` and `page.lower`. It's an alternative to going back to the archive.
- **Skip link**: a "Skip to content" link that is the first thing in the page.
  It's invisible until you press <kbd>Tab</kbd>, and lets keyboard and
  screen-reader users jump past the header and nav straight to `<main>`. Landmarks
  already meet WCAG 2.4.1, but a skip link is the friendlier, more widely
  understood version. It becomes more valuable if the nav grows.
- **Manual light/dark toggle**: only if following the OS setting turns out to be
  wrong in practice. It costs a small script and `localStorage`.
- **Brand accent color**: replace the default blue for unvisited links.
