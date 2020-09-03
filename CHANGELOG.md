# Changelog
All notable changes to this project will be documented in this file.

## [1.0.6] - 2020-09-03
### Changed
- Properly divided `XMLHttpRequestEventTarget` and `XMLHttpRequest` responsabilities between `XHREventTarget` and `XHR`.

## [1.0.5] - 2020-09-02
### Fixed
- Added a simple implementation of `XMLHttpRequestEventTarget` to fix a compatibility issue with Angular 10.

### Changed
- Using `readystate` values from `XMLHttpRequest` instead of `this`.

## [1.0.4] - 2019-11-25
### Fixed
- Fixed `Zone is undefined` error for projects not using Zone.js.
- Added missing readystate constants (UNSENT, OPENED, HEADERS_RECEIVED, LOADING, DONE) on XHR object.

## [1.0.3] - 2019-10-08
### Fixed
- Removed error thrown when giving a `false` value to the `async` param of `open()` to avoid regressions.

## [1.0.2] - 2019-10-08
### Added
- Throwing an error when `async` parameter of `open()` is `false`.

### Fixed
- Fixed crash when accessing headers through `getResponseHeader()` method.

## [1.0.1] - 2017-12-01
### Added
- POST data support.

## [1.0.0] - 2017-07-10
Initial version
