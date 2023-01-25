import {PgnGame, PgnReaderMove, PgnWriterConfiguration} from "./types";

export const writeGame = function(game:PgnGame, configuration:PgnWriterConfiguration = {}) {
    return writePgn(game, configuration)
}


/**
 * Writes the pgn (fully) of the current game. The algorithm goes like that:
 * * Start with the first move (there has to be only one in the main line)
 * * For each move (call that recursively)
 * * print-out the move itself
 * * then the variations (one by one)
 * * then the next move of the main line
 * @return the string of all moves
 */
const writePgn = function(game:PgnGame, configuration:PgnWriterConfiguration) {
    function getGameComment(game:PgnGame):string|undefined {
        return game.gameComment ? game.gameComment.comment : undefined
    }

    const startVariation = function(move:PgnReaderMove):boolean {
        return  move.variationLevel !== undefined && move.variationLevel > 0 &&
            ( (typeof move.prev != "number") || (game.moves[move.prev].next !== move.index));
    }

    const firstMove = function (move):boolean {
        return typeof move.prev != "number"
    }

    const getMove = function (index):PgnReaderMove {
        return game.moves[index]
    }

    // Prepend a space if necessary
    function prependSpace(sb) {
        if ( (!sb.isEmpty()) && (sb.lastChar() !== " ") && (sb.lastChar() !== "\n")) {
            sb.append(" ")
        }
    }

    const writeComment = function(comment:string|undefined|null, sb) {
        if (comment === undefined || comment === null) {
            return
        }
        prependSpace(sb)
        sb.append("{")
        sb.append(comment)
        sb.append("}")
    }

    const writeGameComment = function (game, sb) {
        writeComment(getGameComment(game), sb)
    }

    const writeCommentMove = function(move:PgnReaderMove, sb) {
        writeComment(move.commentMove, sb)
    }

    const writeCommentAfter = function(move:PgnReaderMove, sb) {
        writeComment(move.commentAfter, sb)
    }

    const writeCommentDiag = function(move:PgnReaderMove, sb) {
        let has_diags = (move) => {
            return move.commentDiag &&
                ( ( move.commentDiag.colorArrows && move.commentDiag.colorArrows.length > 0 ) ||
                    ( move.commentDiag.colorFields && move.commentDiag.colorFields.length > 0 )
                )
        }
        let arrows = (move) => { return move.commentDiag.colorArrows || [] }
        let fields = (move) => { return move.commentDiag.colorFields || [] }

        if (has_diags(move)) {
            let sbdiags = new StringBuilder()
            let first = true
            sbdiags.append("[%csl ")
            fields(move).forEach( (field) => {
                ! first ? sbdiags.append(",") : sbdiags.append("")
                first = false
                sbdiags.append(field)
            })
            sbdiags.append("]")
            first = true
            sbdiags.append("[%cal ")
            arrows(move).forEach( (arrow) => {
                ! first ? sbdiags.append(",") : sbdiags.append("")
                first = false
                sbdiags.append(arrow)
            })
            sbdiags.append("]")
            writeComment(sbdiags.toString(), sb)
        }
    }

    const writeMoveNumber = function (move:PgnReaderMove, sb) {
        prependSpace(sb)
        if (move.turn === "w") {
            sb.append("" + move.moveNumber)
            sb.append(".")
        } else if (firstMove(move) || startVariation(move)) {
            sb.append("" + move.moveNumber)
            sb.append("...")
        }
    }

    const writeNotation = function (move:PgnReaderMove, sb) {
        prependSpace(sb)
        sb.append(move.notation.notation)
    }

    const writeNAGs = function(move:PgnReaderMove, sb) {
        if (move.nag) {
            move.nag.forEach(function(ele) {
                sb.append(ele)
            })
        }
    }

    const writeVariation = function (move:PgnReaderMove, sb) {
        prependSpace(sb)
        sb.append("(")
        writeMove(move, sb)
        prependSpace(sb)
        sb.append(")")
    }

    const writeVariations = function (move:PgnReaderMove, sb) {
        for (let i = 0; i < move.variations.length; i++) {
            writeVariation(move.variations[i], sb)
        }
    }

    const getNextMove = function (move:PgnReaderMove) {
        return move.next ? getMove(move.next) : null
    }

    /**
     * Write the normalised notation: comment move, move number (if necessary),
     * comment before, move, NAGs, comment after, variations.
     * Then go into recursion for the next move.
     * @param move the move in the exploded format
     * @param sb the string builder to use
     */
    const writeMove = function(move:PgnReaderMove|undefined|null, sb) {
        if (move === null || move === undefined) {
            return
        }
        writeCommentMove(move, sb)
        writeMoveNumber(move, sb)
        writeNotation(move, sb)
        //write_check_or_mate(move, sb)    // not necessary if san from chess.src is used
        writeNAGs(move, sb)
        writeCommentAfter(move, sb)
        writeCommentDiag(move, sb)
        writeVariations(move, sb)
        const next = getNextMove(move)
        writeMove(next, sb)
    }

    const writeEndGame = function(game:PgnGame, sb) {
        if ( (game.tags !== undefined) && ('Result' in game.tags) ) {
            prependSpace(sb)
            sb.append(game.tags['Result'])
        }
    }

    function writeTags(game, sb) {
        function writeTag(key, value, _sb) {
            if (value) {
                let _v
                if (typeof value === "string") {
                    if (value.length > 0) {
                        _v = value
                    } else { return }
                } else if (typeof value === "object") {
                    _v = value.value
                }
                _sb.append('[').append(key).append(' ').append('"').append(_v).append('"').append("]\n")
            }
        }
        function consumeTag(key, tags, _sb) {
            writeTag(key, tags.get(key), _sb)
            tags.delete(key)
        }

        if (configuration.tags && (configuration.tags == "no")) {
            return
        }
        if ((game.tags) && (Object.keys(game.tags).length)) {
            let _tags:Map<string, any> = new Map(Object.entries(game.tags))
            _tags.delete("messages")    // workaround for internal working of pgn-parser
            "Event Site Date Round White Black Result".split(' ').forEach(
                value => consumeTag(value, _tags, sb))
            _tags.forEach(function (value, key) {
                writeTag(key, value, sb)
            })
            sb.append("\n")
        }
    }

    const writePgn2 = function(game:PgnGame, move:PgnReaderMove, sb) {
        writeTags(game, sb)
        writeGameComment(game, sb)
        writeMove(move, sb)
        writeEndGame(game, sb)
        return sb.toString()
    }

    const sb = new StringBuilder()
    let indexFirstMove = 0
    return writePgn2(game, getMove(indexFirstMove), sb)
}

// Initializes a new instance of the StringBuilder class
// and appends the given value if supplied
class StringBuilder {
    strings: string[] = new Array("")
    // Appends the given value to the end of this instance.
    append(value: string):StringBuilder {
        if (value) {
            this.strings.push(value)
        }
        return this
    }

    // Return true if the receiver is empty. Don't compute length!!
    isEmpty():boolean {
        for (let i = 0; i < this.strings.length; i++) {
            if (this.strings[i].length > 0) {
                return false
            }
        }
        return true
    }

    // Return the last character (as string) of the receiver.
    // Return null if none is found
    lastChar():string|null {
        if (this.strings.length === 0) {
            return null
        }
        return this.strings[this.strings.length - 1].slice(-1)
    }

    // Converts this instance to a String.
    toString() {
        return this.strings.join("")
    }

}
