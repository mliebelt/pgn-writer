let writer = require("../src/pgn-writer.js")
let parser = require("@mliebelt/pgn-parser")
let should = require('should')

const parseWriteGame = function (input, config) {
    let game = parser.parse(input, {startRule: "game"})
    return writer.writeGame(game, config)
}

describe("When writing one game only", function () {
    it("should write that game without configuration in the standard manner", function () {
        let res = parseWriteGame("1. e4 *")
        should.exist(res)
        should(res).equals('1. e4 *')
    })
    it("should write a minimal game (without moves)", function () {
        let res = parseWriteGame("*")
        should.exist(res)
        should(res).equals("*")
    })
    xit("should write some moves in the main line with move number indication", function () {
        let res = parseWriteGame("e4 e5 Nf3 Nc6 Bb5 a6")
        should.exist(res)
        should(res).equals("1. e4 e5 2. Nf3 Nc6 3. Bb5 a6")
    })
})