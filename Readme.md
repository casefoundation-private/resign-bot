# Review-O-Matic

**WARNING: UNDER ACTIVE DEVELOPMENT**

[![Build Status](https://travis-ci.org/casefoundation/review-o-matic.svg?branch=master)](https://travis-ci.org/casefoundation/review-o-matic)
[![Maintainability](https://api.codeclimate.com/v1/badges/1c6705598432dbb288c0/maintainability)](https://codeclimate.com/github/casefoundation/review-o-matic/maintainability)

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

## About

The Review-O-Matic is a tool developed by the Case Foundation to handle the job of collecting and vetting user-submitted content. The system collects submissions via direct input or via an import from another service such as Wufoo. Once in the Review-O-Matic, the newly submitted content goes to a user for review. That reviewer grades and categorizes the content based on customizable prompts. Administrators can then explore the reviewed (and unreviewed) stories as part of a final vetting process.

### Other Features

* Public feed of approved stories
* Administrators and reviewers can manually flag inappropriate stories
* The system will also automatically flag submitted content if it contains bad language
* Ability to set "embargo" schedules where new content is held from the public for a period such as over nights and weekends
* CSV export of all submitted stories
* Ability to reassign reviews
* Designed for customization

## Installation

See [Installation](doc/Installation.md)

## End User Guide

See [End User Guide](doc/End%20User%20Guide.md)

## Development

See [Development](doc/Development.md)

## Contributing

See [Contributing](Contributing.md) for additional information.

## License

See [License](License.txt) for additional information.

## ToDo

### Short Term

* Complete backend unit tests
* Build out end-user documentation

### Long Term

* Build out front end unit tests
* Add a GUI for settings
* Build additional importers

