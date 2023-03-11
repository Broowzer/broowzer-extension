> # ⚠️ This project is going to be archived.
> ## If you're looking to contribute to broowzer-extension, check out its new home at https://github.com/broowzer/broowzer-core. Pull requests against this repository are going to be ignored.

# Broowzer Only Extension

[![Build Status](https://travis-ci.org/broowzer/broowzer-extension.svg?branch=master)](https://travis-ci.org/broowzer/broowzer-extension)

> Experiment moving part of the Broowzer UI into an extension for use in Broowzer only (Not Chrome, it will use APIs not available in Chrome)

## Installation

```bash
# clone broowzer-extension
$ git clone git@github.com:broowzer/broowzer-extension.git

# Install dependencies
$ cd broowzerzer-extension
$ npm install
```

## Development

```bash
# Build files will appear in './dev'
# Start webpack development server
$ npm run dev
```

## Release

### Build

```bash
# build files to './build'
$ npm run build
```

### Packaging


```bash
# compress release into a broowzerzer.zip abroowzeroowzer.crx.
$ npm run build
$ npm run compress -- [options]
```

## Test

* `test/app`: React components, Redux actions & reducers tests
* `test/e2e`: E2E tests (use [chromedriver](https://www.npmjs.com/package/chromedriver), [selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver))

```bash
# lint
$ npm run test-unit

# test/e2e
$ npm run-script build
$ npm run test-e2e
```

## LICENSE

[MPL-2](LICENSE)
