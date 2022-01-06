# <img src=".github/logo.png" align="right" width="100"> pomodoro-edit-core

![Node.js CI](https://github.com/seachicken/pomodoro-edit-core/workflows/Node.js%20CI/badge.svg)
[![npm version](https://badge.fury.io/js/@seachicken%2Fpomodoro-edit-core.svg)](https://badge.fury.io/js/@seachicken%2Fpomodoro-edit-core)

DSL for text-based Pomodoro Timer

## Syntax

```
- [ ] [(25m✍️ 5m☕️)4] xxx
```

- `1h|1m|1s` Timer time (hours or minutes or seconds), even `p1` will be 1 minute
- `...✍️` (Optional) Can add an explanation of what time it is
- `(...)1` (Optional) Repeat the time in parentheses for the specified number of times, or repeat many times if the number is omitted.

## Used by
- [Pomodoro Edit for Inkdrop](https://github.com/seachicken/inkdrop-pomodoro-edit)
- [Pomodoro Edit for VSCode](https://github.com/seachicken/vscode-pomodoro-edit)
