# Newtelco Billing Verification

Itenos Masterdata Sheet - https://docs.google.com/spreadsheets/d/1zA4HA3DCceRFqEIwkTTITGjxxEr8QaIDhRrEwFeKR2s/edit#gid=688542946

## Install

First, clone the repo via git and install dependencies:

```bash
git clone https://github.com/newtelco/billing-parser.git
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
