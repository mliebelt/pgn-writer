# In a nutshell ...
Provides base functionality (implemented in Javascript) to write PGN to a string. The input is the one produced by pgn-parser, and used as well by pgn-reader.

# Goals

* Implement the part of `modules/pgn-reader/src/pgn.js`, there `write_pgn`.
* Provide a configuration that allows different output formats / options.
* Allow to be used to do the following scenario
  1. Import a huge collection of PGN games (one file).
  1. Write info/warning/error messages on reading (not part of this library).
  1. Export those games (or a subset of it) in a standard format: This is what is provided by this library.
  
See the [annotated spec](https://github.com/mliebelt/pgn-spec-commented/blob/main/annotated/export.md) that should be sufficient for guiding the implementation.
    
# Usage

The following is pseudo-code, there is no implementation yet ...

```
import {pgnReader} from '@mliebelt/pgn-reader'
import {pgnWriter} from '@mliebelt/pgn-writer'

let games = pgnReader({ config1: 'param', ... }).getGames()
let writer = pgnWriter(games, { config2: 'param', ... })
writer.export({ mode: 'onlyPgn' })
