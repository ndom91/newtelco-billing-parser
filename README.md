<h1>Newtelco Billing Verification</h1>
<hr />

<div align="center">

[![Build Status][github-actions-status]](github-actions-status)
[![Dependency Status][david-image]][david-url]
[![DevDependency Status][david-dev-image]][david-dev-url]
[![Github Tag][github-tag-image]][github-tag-url]

</div>

## Install

First, clone the repo via git and install dependencies:

```bash
git clone https://git.newtelco.dev/ndomino/billing-parser.git
cd billing-parser
yarn
```

## Starting Development

Start the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a webpack dev server that sends hot updates to the renderer process:

```bash
yarn dev
```

## Packaging for Production

To package apps for the local platform:

```bash
yarn package
```

Alternatively, you can package for individual environments with `yarn package-linux` or `yarn package-win`

## Maintainers

- [Nico Domino](https://github.com/ndom91)

## License

MIT © [Newtelco Billing Parser](https://github.com/newtelco/billing-parser)
