# Contributing

## Pull Requests

### Creating a Pull Request

This application has been designed so that people can easily expand it.
To request us to review code that you create, you will need to create a pull request.
Creating a pull request is described in
 [this tutorial](https://www.digitalocean.com/community/tutorials/how-to-create-a-pull-request-on-github).

### Linting

Before creating a pull request to this application, you will want to lint it first.
This is due to linting being required to pass before a pull request can be merged.

To lint, simply run `npm test`. This will lint all the JS files used for the embed script.

If there are any errors that can be automatically be fixed with the JS files, you can execute
 `npm run test:fix` to automatically do that.
 
This project enforces LF line styles, 4 spaces, semi-colons and dangling commas.
The linting will fail if this is not followed.

## Issue Creation

In the event that you have an issue using the embed script or have a suggestion for a change but
 don't want to contribute code, we are more than happy to help.

Make sure that when you create your issue, it follows the format for the type of issue you select
 (we have individual templates for each issue type).
 
Issue template types include the following:
 - Bug Reporting
 - Feature Requests
 - Help Requests
