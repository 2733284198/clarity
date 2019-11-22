/*
 * Copyright (c) 2016-2019 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

// const browsers = {
//   chrome_latest_win_10: {
//     base: 'SauceLabs',
//     browserName: 'chrome',
//     version: 'latest',
//     platform: 'Windows 10',
//   },
//   firefox_latest_win_10: {
//     base: 'SauceLabs',
//     browserName: 'firefox',
//     version: 'latest',
//     platform: 'Windows 10',
//   },
//   safari_latest_osx_11: {
//     base: 'SauceLabs',
//     browserName: 'safari',
//     version: 'latest',
//     platform: 'macOS 10.13',
//   },
//   ie_11_win_8_1: {
//     base: 'SauceLabs',
//     browserName: 'internet explorer',
//     version: 'latest',
//     platform: 'Windows 8.1',
//   },
//   edge_latest_win_10: {
//     base: 'SauceLabs',
//     browserName: 'MicrosoftEdge',
//     version: 'latest',
//     platform: 'Windows 10',
//   },
// };

module.exports = function(karma) {
  'use strict';

  const config = {
    autoWatch: true,
    basePath: '',
    // TODO NG9 - Turn on parallel again
    frameworks: ['jasmine', 'jasmine-matchers', '@angular-devkit/build-angular'],
    plugins: [
      // Frameworks
      require('karma-jasmine'),
      require('karma-jasmine-matchers'),
      require('@angular-devkit/build-angular/plugins/karma'),
      // Reporters
      require('karma-jasmine-html-reporter'),
      require('karma-htmlfile-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-mocha-reporter'),
      require('karma-notify-reporter'),
      // Launchers
      require('karma-chrome-launcher'),
      require('karma-edge-launcher'),
      require('karma-ie-launcher'),
      require('karma-firefox-launcher'),
      require('karma-safari-launcher'),
      require('karma-sauce-launcher'),
      require('karma-parallel'),
    ],
    parallelOptions: {
      executors: getNumberOfExecutors(),
      shardStrategy: 'round-robin',
    },
    files: [
      // Custom Elements
      {
        pattern: './../../node_modules/@webcomponents/custom-elements/custom-elements.min.js',
        included: true,
        watched: false,
      },
      {
        pattern: './../../node_modules/@webcomponents/shadycss/apply-shim.min.js',
        included: true,
        watched: false,
      },
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        random: false,
      },
    },
    reporters: ['mocha', 'coverage-istanbul', 'html', 'notify'],
    htmlReporter: {
      outputFile: './../../reports/unit/index.html',
      useLegacyStyle: true,
      useCompactStyle: true,
    },
    coverageIstanbulReporter: {
      dir: './reports/coverage/clr-angular',
      fixWebpackSourcePaths: true,
      reports: ['html', 'lcovonly', 'cobertura'],
      thresholds: {
        statements: 90,
        lines: 90,
        branches: 80, // goal to increase this to 90%
        functions: 90,
      },
    },
    browsers: [
      // ChromeHeadless is the default, but you can toggle this list in dev. Always reset back to just ChromeHeadless.
      'ChromeHeadless',
      // "FirefoxHeadless",
      // "Safari",
      // "Edge",
      // "IE",
    ],
    browserNoActivityTimeout: 100000,
    port: 9090,
    runnerPort: 9191,
    colors: true,
    logLevel: karma.LOG_INFO,
    singleRun: process.env.CIRCLECI ? true : false,
    concurrency: Infinity,
    captureTimeout: 120000,
    customLaunchers: {
      ChromeHeadless: {
        base: 'Chrome',
        flags: ['--headless', '--disable-gpu', '--remote-debugging-port=9222', '--disable-dev-shm-usage'],
      },
    },
    mochaReporter: {
      ignoreSkipped: true,
    },
  };

  karma.set(config);
};

function getNumberOfExecutors() {
  if (process.env.CIRCLECI) {
    // optimize for more threads but CIRCLECI needs a limited set of 2
    return 2;
  } else if (process.env.npm_lifecycle_event === 'angular:test:watch') {
    // in watch mode we only want a single instance of chrome running for easier debugging
    return 1;
  } else {
    // when running the single build/test optimize for more threads
    return Math.ceil(require('os').cpus().length / 2);
  }
}
