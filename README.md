# Personal Website

Currently available @ [jaylooney.dev](https://jaylooney.dev)

Built with [Zola](https://www.getzola.org/) and the custom
[zenware](themes/zenware/README.md) theme.

## Building

```
nix develop
zola build
```

Use `zola serve` for a local preview.

## Benchmarks

Measured October 2026 against the live site, using the same tools as the
[Zola themes benchmarks](https://github.com/Jieiku/zola-themes-benchmarks):

| Metric | zenware (jaylooney.dev) | abridge (abridge.pages.dev) |
| --- | --- | --- |
| Page weight (KB) | **21** | 26 |
| [Lighthouse](https://pagespeed.web.dev/) average (GL) | **100** | 100 |
| [Yellow Lab Tools](https://yellowlab.tools/) (YL) | **100** | 100 |
| [Mozilla Observatory](https://developer.mozilla.org/en-US/observatory/) (MO) | **140 (A+)** | 130 (A+) |

- **KB** is Lighthouse's total byte weight; **GL** averages the four Lighthouse
  categories (performance, accessibility, best practices, SEO).
- Lighthouse scored 100 across the board on every page checked (home, `/about/`,
  `/archive/`, and a post), on both mobile and desktop.
- Homepage mobile timings: FCP **0.3 s**, LCP **0.3 s**, TBT **0 ms**, CLS **0**,
  Speed Index **0.3 s** (abridge: 1.0 s / 1.0 s / 0 ms / 0 / 1.1 s).
- Observatory: 12/12 tests passed, A+.
- Page weight is about 7 KB without the Cloudflare Web Analytics beacon; the
  theme itself is one stylesheet plus the favicon.
