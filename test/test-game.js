let writer = require("../src/pgn-writer.js")
let pgnReader = require('@mliebelt/pgn-reader').pgnReader
let should = require('should')

/* Utility function to have minimal test setup. Reads the input as usual, tests only the output then. */
const parseWriteGame = function (input, config) {
    let game = pgnReader({ pgn: input})
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
    it("should write some moves in the main line with move number indication", function () {
        let res = parseWriteGame("e4 e5 Nf3 Nc6 Bb5 a6")
        should.exist(res)
        should(res).equals("1. e4 e5 2. Nf3 Nc6 3. Bb5 a6")
    })
    it("should write variations as well", function () {
        let res = parseWriteGame("e4 e5 (d5 exd5) Nf3 Nc6")
        should.exist(res)
        should(res).equals("1. e4 e5 ( 1... d5 2. exd5 ) 2. Nf3 Nc6")
    })
    it ("should write comments in standard format", function () {
        let res = parseWriteGame("e4    { comment1 with some words} {comment2 with more words}")
        should.exist(res)
        should(res).equals("1. e4 { comment1 with some words comment2 with more words}")
    })
    it("should write tags in standard format with whitespace in between", function () {
        let res = parseWriteGame(' [ White    "Me"   ]  [  Black  "Magnus"   ] 1. e4')
        should.exist(res)
        should(res).equals('[White "Me"]\n[Black "Magnus"]\n\n1. e4')
    })
    it("should write tags in standard format", function () {
        let res = parseWriteGame('[White "Me"][Black "Magnus"] 1. e4')
        should.exist(res)
        should(res).equals('[White "Me"]\n[Black "Magnus"]\n\n1. e4')
    })
    it("should write  7 roster tag the right order", function () {
        let res = parseWriteGame('[White "Me"][Black "Magnus"][Date "????.??.??"] 1. e4')
        should.exist(res)
        should(res).equals('[Date "????.??.??"]\n[White "Me"]\n[Black "Magnus"]\n\n1. e4')
    })
    it("should write game comment", function () {
        let res = parseWriteGame('{Comment before first move} 1. e4 e5')
        should.exist(res)
        should(res).equals('{Comment before first move} 1. e4 e5')
    })
    it("should write game comment and normal comment", function () {
        let res = parseWriteGame('{Game comment}   1.   e4 {Normal comment}  ')
        should.exist(res)
        should(res).equals('{Game comment} 1. e4 {Normal comment}')
    })
    it ("should write game termination if there", function () {
        let res = parseWriteGame("1. e4   1-0  ")
        should.exist(res)
        should(res).equals('1. e4 1-0')
    })
    it ("should write NAGs in $-notation only", function () {
        let res = parseWriteGame("1. e4! e5? 2. Nf3!! Nc6??   1-0  ")
        should.exist(res)
        should(res).equals('1. e4$1 e5$2 2. Nf3$3 Nc6$4 1-0')
    })
    it ("should read position and have correct move number then", function () {
        let res = parseWriteGame('[FEN "rn3rk1/1b2qppp/p3p3/1pn1P3/3N1PQ1/1BN5/PP4PP/R4RK1 w - - 0 15"]\n' +
            '[SetUp "1"]\n\n f5 Kh8?? f6 gxf6 exf6 { Black resigns. } 1-0')
        should.exist(res)
        should(res).equals('[FEN "rn3rk1/1b2qppp/p3p3/1pn1P3/3N1PQ1/1BN5/PP4PP/R4RK1 w - - 0 15"]\n' +
            '[SetUp "1"]\n\n15. f5 Kh8$4 16. f6 gxf6 17. exf6 { Black resigns. } 1-0')
    })
    it("should have header mapped to FEN", function() {
        let res = parseWriteGame('[SetUp "1"] [FEN "8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57"] *')
        should.exist(res)
        should(res).equals('[FEN "8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57"]\n[SetUp "1"]\n\n*')
    });
    it("should have first black move correctly written including move number", function() {
        let res = parseWriteGame('[SetUp "1"] [FEN "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"] d5 d4')
        should.exist(res)
        should(res).equals('[FEN "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"]\n[SetUp "1"]\n\n1... d5 2. d4')
    });

})