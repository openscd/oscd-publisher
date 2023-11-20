# \<oscd-publisher>

## What is this?

This is an editor plugin for [open-scd-core](https://github.com/openenergytools/open-scd-core#readme), the new core editor engine for OpenSCD. With this plugin you can edit control block and related elements and its data sets. Visit the [SCLEditor](https://openenergytools.github.io/scl-editor) and see for yourself.

## Features on the roadmap

- create `SampledValueControl` elements
- re-allocate control blocks in data model (new once are allocated the first logical device `LLN0`)
- show maximum size of DataSet element encoded with ASN.1 BER
- more use guidance and notification in the UI

If you see anything missing please file an [feature request issue](https://github.com/openenergytools/oscd-publisher/issues)

## Local Demo with `web-dev-server`

```bash
npm start
```

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

To run a local development server that serves the basic demo located in `demo/index.html`

&copy; Jakob Vogelsang
