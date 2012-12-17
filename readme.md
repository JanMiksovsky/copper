Copper
======

Setup
-----
1. Install Node from nodejs.org. This should also install npm, the node package
manager.
2. Install the Node modules required to build via:

  ```bash
  npm install
  ```

Build
-----
From this directory:

```bash
grunt
```

General organization
--------------------
This single project is used to build what appear to be four separate apps/sites:
* karma - Karma game (top level of Copper FB app)
* timeline - Ann's timeline
* dup - Department of Unified Protection site
* duplang - Site devoted to DUP programming language

Some of the other ancillary top-level folders:
* controls - controls shared by the different aspects of Copper
* gen - build-time tools for certain puzzles
* test - unit tests with QUnit
* utilities - other shared functions
