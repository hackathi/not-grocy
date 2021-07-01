# Contributing

You want to contribute code to grocy? Thank you!

To ensure consistency across all developers of not-grocy, we are setting up
a set of Contribution Guidelines. These can, and should be, considered law.

You are implementing a feature and want intermediate feedback? Please use
a draft PR.

Once your pull request is ready, it will be subject to code review. Only
if all things found in the review are resolved (either by changing the
code in question or agreeing that a change is not neccesary) a PR gets
merged.

Some of the rules outlined here are enforced by automatic tooling; either
because they can be fixed automatically (most of the eslint rules) or
because they generate warnings and errors.

As a rule of thumb: **If your code adds new style warnings, please
explain the reasoning and disable the warning for that scope. Code
that violates the guidelines outlined in this document will not get
merged.**

## Frontend

We do not have settled on a javascript coding style yet; so for the moment,
we are keeping what is there but enforce that:

- `eslint:recommended` as base
- Allman-Style braces (that is, braces to be put on their own lines)
- **Use tabs for indentation.**
- **Always** use semicolons.

### Remarks
- We use ES12 / ES2021 and transpile down to ES2015. Don't use anything that
  can't be transpiled.
- *Do* write classes. Aim for one class per file.
- If refactoring, consider encapsulating the logic in a class.
- If using jQuery, ensure that your selectors can be scoped to a parent element.
  not-grocy has some code paths that possibly result in a situation where two
  DOM elements have the same ID. As a temporary workaround, since jQuery always
  returns the first descendant with that ID, we scoped components and views.

  This is a bolt-on solution for a problem that shouldn't even exist in the
  first place, and we're actively in the process of fixing it for good.
- If possible, remove 3rd party dependencies that depend on jQuery.

## Backend

Similarly, we do not have decided on a coding style yet, but it'll
probably be PSR-12 with slight modifications.

In the meantime:

- Use Allman-style braces
- Indent with tabs

### Remarks
- Do not use php features newer than php 7.3.
- Aim for one class per file.
- Your classes / namespaces must comply to PSR-4.