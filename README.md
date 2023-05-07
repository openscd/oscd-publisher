# \<oscd-publisher>

## What is this?

This is an editor plugin for [open-scd-core](https://github.com/openscd/open-scd-core#readme), the new core editor engine for OpenSCD. With this plugin you can edit control block and related elements and its data sets. Visit the [demo environment](https://shorturl.at/ENV03) and see for yourself.

## Missing features

- edit `SampledValueControl` elements
- create `SampledValueControl` elements
- re-allocate control blocks in data model (new once are allocated the first logical device `LLN0`)
- re-arrange `FCDA` element in the `DataSet`

## Quick access tp the plugin

## Linting and formatting

To scan the project for linting and formatting errors, run

```bash
npm run lint
```

To automatically fix linting and formatting errors, run

```bash
npm run format
```

## Testing with Web Test Runner

To execute a single test run:

```bash
npm run test
```

To run the tests in interactive watch mode run:

```bash
npm run test:watch
```

## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `web-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`

&copy; Jakob Vogelsang
