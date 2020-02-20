# [www.jaylooney.dev](https://www.jaylooney.dev)
[![Netlify Status](https://api.netlify.com/api/v1/badges/2eeb5177-debb-422f-b042-3d0336bfd884/deploy-status)](https://app.netlify.com/sites/jaylooney/deploys)

This is my personal website.
It's deployed to [netlify](https://www.netlify.com/), a nice modern PaaS for static sites.
Originally based on LekoArts gatsby-starter-minimal-blog template.

Currently it's based on Hugo.

## About Me

I'm a software developer.

[Demo Website](https://minimal-blog.lekoarts.de)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/LekoArts/gatsby-starter-minimal-blog) [![Edit gatsby-starter-minimal-blog](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/LekoArts/gatsby-starter-minimal-blog/tree/master/)

[![CircleCI](https://circleci.com/gh/LekoArts/gatsby-starter-minimal-blog.svg?style=svg)](https://circleci.com/gh/LekoArts/gatsby-starter-minimal-blog) [![Netlify Status](https://api.netlify.com/api/v1/badges/f466015c-14f4-440d-a92b-0b0e30de609a/deploy-status)](https://app.netlify.com/sites/minimal-blog/deploys)

## Features

- Code highlighting (with [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer)) and live preview (with [react-live](https://github.com/FormidableLabs/react-live))
- Netlify Contact Form
- Categories
- Offline Support
- WebApp Manifest Support
- SEO
  - Sitemap
  - Schema.org JSONLD
  - OpenGraph Tags
  - Twitter Tags

## Getting Started

```
gatsby new project-name https://github.com/LekoArts/gatsby-starter-minimal-blog
cd project-name
npm run develop
```

### Building your site

```
npm run build
```

Copy the content of the `public` folder to your webhost or use a website like Netlify which automates that for you.

**Attention:** You also need to edit `static/robots.txt` to include your domain!
