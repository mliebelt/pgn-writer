# In a nutshell ...
Provides base functionality (implemented in Javascript) to write PGN to a string. The input is the one produced by pgn-parser, and used as well by pgn-reader.

# Goals

* Implement the part of `modules/pgn-reader/src/pgn.js`, there `write_pgn`.
* Provide a configuration that allows different output formats / options.
* Allow to be used to do the following scenario
  1. Import a huge collection of PGN games (one file).
  1. Write info/warning/error messages on reading (not part of this library).
  1. Export those games (or a subset of it) in a standard format: This is what is provided by this library.
  1. Allow variants in writing: strip tags; strip variants; strip kind of comments (arrows and circles, time comments, ...); strip NAGs; use a different language for export (by giving the locale)
  
See the [annotated spec](https://github.com/mliebelt/pgn-spec-commented/blob/main/annotated/export.md) that should be sufficient for guiding the implementation.
    
# Usage

The following is pseudo-code, the interface is not defined completely and will change in the future. But I moved the source to typescript, and have added type annotations where necessary. Look at the annotations `PgnGame` and `PgnWriterConfiguation` which are currently the only arguments to the main function. The function `getGame(<index>)` of pgn-reader not yet exists, but will be added in the next version.

```
import {PgnReader} from '@mliebelt/pgn-reader'
import {writeGame} from '@mliebelt/pgn-writer'

let game = new PgnReader({ pgn: '1. e4 *', ... }).getGame(0)
let resultPGN = writeGame(game, { config2: 'param', ... })
```
