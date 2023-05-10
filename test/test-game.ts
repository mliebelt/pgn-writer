import {describe} from "mocha";

const should = require('chai').should()
import { writeGame } from "../src"
import { PgnReader} from "@mliebelt/pgn-reader";
import { PgnWriterConfiguration, PgnGame} from "../src";

/* Utility function to have minimal test setup. Reads the input as usual, tests only the output then. */
const parseWriteGame = function (input, config?:any) {
    let reader = new PgnReader({ pgn: input})
    let game:PgnGame = Object.assign({}, reader.games[0], { moves: reader.getMoves()}) as PgnGame
    // game.moves = reader.getMoves()
    return writeGame(game, config)
}
const parseWriteGameNoTags = function (input, config?:any) {
    let reader = new PgnReader({ pgn: input})
    let game = Object.assign({}, reader.games[0], { moves: reader.getMoves()}) as PgnGame
    let noTags:PgnWriterConfiguration = { tags: "no"}
    return writeGame(game, {...config, ...noTags})
}

describe("When writing one game only", function () {
    it("should write that game without configuration in the standard manner", function () {
        let res = parseWriteGameNoTags("1. e4 *")
        should.exist(res)
        should.equal(res, '1. e4 *')
    })
    it("should write a minimal game (without moves)", function () {
        let res = parseWriteGameNoTags("*")
        should.exist(res)
        should.equal(res,"*")
    })
    it("should write some moves in the main line with move number indication", function () {
        let res = parseWriteGameNoTags("e4 e5 Nf3 Nc6 Bb5 a6")
        should.exist(res)
        should.equal(res, "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6")
    })
    it("should write variations as well", function () {
        let res = parseWriteGameNoTags("e4 e5 (d5 exd5) Nf3 Nc6")
        should.exist(res)
        should.equal(res, "1. e4 e5 ( 1... d5 2. exd5 ) 2. Nf3 Nc6")
    })
    it ("should write comments in standard format", function () {
        let res = parseWriteGameNoTags("e4    { comment1 with some words} {comment2 with more words}")
        should.exist(res)
        should.equal(res, "1. e4 { comment1 with some words comment2 with more words}")
    })
    it("should write tags in standard format with whitespace in between", function () {
        let res = parseWriteGame(' [ White    "Me"   ]  [  Black  "Magnus"   ] 1. e4')
        should.exist(res)
        should.equal(res, '[White "Me"]\n[Black "Magnus"]\n\n1. e4')
    })
    it("should write tags in standard format", function () {
        let res = parseWriteGame('[White "Me"][Black "Magnus"] 1. e4')
        should.exist(res)
        should.equal(res, '[White "Me"]\n[Black "Magnus"]\n\n1. e4')
    })
    it("should write  7 roster tag the right order", function () {
        let res = parseWriteGame('[White "Me"][Black "Magnus"][Date "????.??.??"] 1. e4')
        should.exist(res)
        should.equal(res, '[Date "????.??.??"]\n[White "Me"]\n[Black "Magnus"]\n\n1. e4')
    })
    it("should write game comment", function () {
        let res = parseWriteGameNoTags('{Comment before first move} 1. e4 e5')
        should.exist(res)
        should.equal(res, '{Comment before first move} 1. e4 e5')
    })
    it("should write game comment and normal comment", function () {
        let res = parseWriteGameNoTags('{Game comment}   1.   e4 {Normal comment}  ')
        should.exist(res)
        should.equal(res, '{Game comment} 1. e4 {Normal comment}')
    })
    it ("should write game termination if there", function () {
        let res = parseWriteGameNoTags("1. e4   1-0  ")
        should.exist(res)
        should.equal(res, '1. e4 1-0')
    })
    it ("should write NAGs in $-notation only", function () {
        let res = parseWriteGameNoTags("1. e4! e5? 2. Nf3!! Nc6??   1-0  ")
        should.exist(res)
        should.equal(res, '1. e4$1 e5$2 2. Nf3$3 Nc6$4 1-0')
    })
    it ("should read position and have correct move number then", function () {
        let res = parseWriteGame('[FEN "rn3rk1/1b2qppp/p3p3/1pn1P3/3N1PQ1/1BN5/PP4PP/R4RK1 w - - 0 15"]\n' +
            '[SetUp "1"]\n\n f5 Kh8?? f6 gxf6 exf6 { Black resigns. } 1-0')
        should.exist(res)
        should.equal(res, '[Result "1-0"]\n[FEN "rn3rk1/1b2qppp/p3p3/1pn1P3/3N1PQ1/1BN5/PP4PP/R4RK1 w - - 0 15"]\n' +
            '[SetUp "1"]\n\n15. f5 Kh8$4 16. f6 gxf6 17. exf6 { Black resigns. } 1-0')
    })
    it("should have header mapped to FEN", function() {
        let res = parseWriteGame('[SetUp "1"] [FEN "8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57"] *')
        should.exist(res)
        should.equal(res, '[Result "*"]\n[SetUp "1"]\n[FEN "8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57"]\n\n*')
    });
    it("should have first black move correctly written including move number", function() {
        let res = parseWriteGame('[SetUp "1"] [FEN "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"] d5 d4')
        should.exist(res)
        should.equal(res, '[SetUp "1"]\n[FEN "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"]\n\n1... d5 2. d4')
    });

})

describe("When writing results of games", function () {
    it("should write result for empty game", function (){
        let res = parseWriteGameNoTags('')
        should.exist(res)
        should.equal(res, '*')
    })
    // Don't understand why only here the result is not included
    xit("should write result for simple game", function (){
        let res = parseWriteGameNoTags('e4 e5')
        should.equal(res, '1. e4 e5 *')
    })
    it("should add end game string if tag 'Result' is set", function () {
        let res = parseWriteGameNoTags('[Result "1-0"] e4 e5')
        should.equal(res, '1. e4 e5 1-0')
    })
    it("should add end game string if pgn contains the result", function () {
        let res = parseWriteGameNoTags('e4 e5 1-0')
        should.equal(res, '1. e4 e5 1-0')
    })
})

describe("When writing tags of games", function () {
    it("should allow standard tags and not writing them", function () {
        let input:string =  '[Event "ChessDojo Open Classical - 2023-04"]\n' +
            '  [Site "Chess.com"]\n' +
            '  [Date "2023.04.27"]\n' +
            '  [Round "15"]\n' +
            '  [White "jenesuispasdave"]\n' +
            '  [Black "factoryfreak"]\n' +
            '  [Result "1-0"]\n' +
            '  [WhiteElo "790"]\n' +
            '  [BlackElo "873"]\n' +
            '  [TimeControl "5400+30"]\n' +
            '  [Termination "jenesuispasdave won by checkmate"]\n' +
            '  [Annotator "jenesuispasdave"]\n' +
            '  [UTCDate "2023.05.02"]\n' +
            '  [UTCTime "02:06:08"]\n' +
            '  [Variant "Standard"]\n' +
            '  [ECO "C50"]\n' +
            '  [Opening "Italian Game: Anti-Fried Liver Defense"]\n' +
            '  [Source "https://lichess.org/study/tUmAdyQJ/80CyeGO8"]\n' +
            '  [PlyCount "83"]\n' +
            'e4 e5 Nf3 Nc6'
        let res = parseWriteGameNoTags(input)
        should.equal(res, '1. e4 e5 2. Nf3 Nc6 1-0')
    })
    it("should allow standard tags and writing them", function () {
        let input:string =  '[Event "ChessDojo Open Classical - 2023-04"]\n' +
            '  [Site "Chess.com"]\n' +
            '  [Date "2023.04.27"]\n' +
            '  [Round "15"]\n' +
            '  [White "jenesuispasdave"]\n' +
            '  [Black "factoryfreak"]\n' +
            '  [Result "1-0"]\n' +
            '  [WhiteElo "790"]\n' +
            '  [BlackElo "873"]\n' +
            '  [TimeControl "5400+30"]\n' +
            '  [Termination "jenesuispasdave won by checkmate"]\n' +
            '  [Annotator "jenesuispasdave"]\n' +
            '  [UTCDate "2023.05.02"]\n' +
            '  [UTCTime "02:06:08"]\n' +
            '  [Variant "Standard"]\n' +
            '  [ECO "C50"]\n' +
            '  [Opening "Italian Game: Anti-Fried Liver Defense"]\n' +
            '  [Source "https://lichess.org/study/tUmAdyQJ/80CyeGO8"]\n' +
            '  [PlyCount "83"]\n' +
            'e4 e5 Nf3 Nc6'
        let res = parseWriteGame(input)
        should.equal(res, '[Event "ChessDojo Open Classical - 2023-04"]\n' +
            '[Site "Chess.com"]\n' +
            '[Date "2023.04.27"]\n' +
            '[Round "15"]\n' +
            '[White "jenesuispasdave"]\n' +
            '[Black "factoryfreak"]\n' +
            '[Result "1-0"]\n' +
            '[WhiteElo "790"]\n' +
            '[BlackElo "873"]\n' +
            '[TimeControl "5400+30"]\n' +
            '[Termination "jenesuispasdave won by checkmate"]\n' +
            '[Annotator "jenesuispasdave"]\n' +
            '[UTCDate "2023.05.02"]\n' +
            '[UTCTime "02:06:08"]\n' +
            '[Variant "Standard"]\n' +
            '[ECO "C50"]\n' +
            '[Opening "Italian Game: Anti-Fried Liver Defense"]\n' +
            '[Source "https://lichess.org/study/tUmAdyQJ/80CyeGO8"]\n' +
            '[PlyCount "83"]\n' +
            '\n' +
            '1. e4 e5 2. Nf3 Nc6 1-0')
    })
    it('should allow writing single tags without values', function () {
        let input = '[TimeControl "5400+30"]\n' +
            'e4 e5'
        let res = parseWriteGame(input)
        should.equal(res, '[TimeControl "5400+30"]\n\n1. e4 e5')
    });
})

describe("When using different configuration", function () {
    it("should write long notation if requested", function (){
        let reader = new PgnReader({ pgn: 'e4 e5 Nf3 Nc6'})
        let game:PgnGame = Object.assign({}, reader.games[0], { moves: reader.getMoves()}) as PgnGame
        let noTags:PgnWriterConfiguration = { tags: "no"}
        noTags.notation = "long"
        let res = writeGame(game, noTags)
        should.equal(res, '1. e2-e4 e7-e5 2. Ng1-f3 Nb8-c6')
    })
})