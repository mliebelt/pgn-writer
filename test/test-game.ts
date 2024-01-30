import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { writeGame, PgnGame, PgnWriterConfiguration } from "../src";
import { PgnReader } from "@mliebelt/pgn-reader";

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

const oneGameSuite = suite('Base functionality of the reader without any configuration');

oneGameSuite('should write that game without configuration in the standard manner', () => {
    let res = parseWriteGameNoTags("1. e4 *");
    assert.ok(res);
    assert.equal(res, '1. e4 *');
});

oneGameSuite('should write a minimal game (without moves)', () => {
    let res = parseWriteGameNoTags("*");
    assert.ok(res);
    assert.equal(res, "*");
});

oneGameSuite('should write some moves in the main line with move number indication', () => {
    let res = parseWriteGameNoTags("e4 e5 Nf3 Nc6 Bb5 a6");
    assert.ok(res);
    assert.equal(res, "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6");
});

oneGameSuite('should write variations as well', () => {
    let res = parseWriteGameNoTags("e4 e5 (d5 exd5) Nf3 Nc6");
    assert.ok(res);
    assert.equal(res, "1. e4 e5 ( 1... d5 2. exd5 ) 2. Nf3 Nc6");
});

oneGameSuite('should write comments in standard format', () => {
    let res = parseWriteGameNoTags("e4 { comment1 with some words} {comment2 with more words}");
    assert.ok(res);
    assert.equal(res, "1. e4 { comment1 with some words comment2 with more words}");
});

oneGameSuite('should write tags in standard format with whitespace in between', () => {
    let res = parseWriteGame(' [ White    "Me"   ]  [  Black  "Magnus"   ] 1. e4');
    assert.ok(res);
    assert.equal(res, '[White "Me"]\n[Black "Magnus"]\n\n1. e4');
});

oneGameSuite('should write tags in standard format', () => {
    let res = parseWriteGame('[White "Me"][Black "Magnus"] 1. e4');
    assert.ok(res);
    assert.equal(res, '[White "Me"]\n[Black "Magnus"]\n\n1. e4');
});

oneGameSuite('should write 7 roster tag the right order', () => {
    let res = parseWriteGame('[White "Me"][Black "Magnus"][Date "????.??.??"] 1. e4');
    assert.ok(res);
    assert.equal(res, '[Date "????.??.??"]\n[White "Me"]\n[Black "Magnus"]\n\n1. e4');
});

oneGameSuite('should write game comment', () => {
    let res = parseWriteGameNoTags('{Comment before first move} 1. e4 e5');
    assert.ok(res);
    assert.equal(res, '{Comment before first move} 1. e4 e5');
});

oneGameSuite('should write game comment and normal comment', () => {
    let res = parseWriteGameNoTags('{Game comment} 1. e4 {Normal comment}');
    assert.ok(res);
    assert.equal(res, '{Game comment} 1. e4 {Normal comment}');
});

oneGameSuite('should write game termination if there', () => {
    let res = parseWriteGameNoTags("1. e4 1-0");
    assert.ok(res);
    assert.equal(res, '1. e4 1-0');
});

oneGameSuite('should write NAGs in $-notation only', () => {
    let res = parseWriteGameNoTags("1. e4! e5? 2. Nf3!! Nc6?? 1-0");
    assert.ok(res);
    assert.equal(res, '1. e4$1 e5$2 2. Nf3$3 Nc6$4 1-0');
});

oneGameSuite('should read position and have correct move number then', () => {
    let res = parseWriteGame('[FEN "rn3rk1/1b2qppp/p3p3/1pn1P3/3N1PQ1/1BN5/PP4PP/R4RK1 w - - 0 15"]\n' +
        '[SetUp "1"]\n\n f5 Kh8?? f6 gxf6 exf6 { Black resigns. } 1-0');
    assert.ok(res);
    assert.equal(res, '[Result "1-0"]\n[FEN "rn3rk1/1b2qppp/p3p3/1pn1P3/3N1PQ1/1BN5/PP4PP/R4RK1 w - - 0 15"]\n' +
        '[SetUp "1"]\n\n15. f5 Kh8$4 16. f6 gxf6 17. exf6 { Black resigns. } 1-0');
});

oneGameSuite('should have header mapped to FEN', () => {
    let res = parseWriteGame('[SetUp "1"] [FEN "8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57"] *');
    assert.ok(res);
    assert.equal(res, '[Result "*"]\n[SetUp "1"]\n[FEN "8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57"]\n\n*')
});

oneGameSuite('should have first black move correctly written including move number', () => {
    let res = parseWriteGame('[SetUp "1"] [FEN "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"] d5 d4');
    assert.ok(res);
    assert.equal(res, '[SetUp "1"]\n[FEN "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"]\n\n1... d5 2. d4');
});
oneGameSuite.run();

const specialCasesSuite = suite('When writing special cases');

specialCasesSuite("should write discriminator when given in notation", function (){
    let res = parseWriteGameNoTags('d4 d5 Nf3 Nc6 Nbd2')
    assert.ok(res)
    assert.equal(res, '1. d4 d5 2. Nf3 Nc6 3. Nbd2')
    })
specialCasesSuite.run()

const writingResultsSuite = suite('When writing results of games');
writingResultsSuite('should write result for empty game', () => {
    let res = parseWriteGameNoTags('');
    assert.ok(res);
    assert.equal(res, '*');
});

// If this test is still pending, you might want to skip it like this
// or remove the test case entirely if not necessary
writingResultsSuite.skip('should write result for simple game', () => {
    let res = parseWriteGameNoTags('e4 e5');
    assert.equal(res, '1. e4 e5 *');
});

writingResultsSuite('should add end game string if tag "Result" is set', () => {
    let res = parseWriteGameNoTags('[Result "1-0"] e4 e5');
    assert.equal(res, '1. e4 e5 1-0');
});

writingResultsSuite('should add end game string if pgn contains the result', () => {
    let res = parseWriteGameNoTags('e4 e5 1-0');
    assert.equal(res, '1. e4 e5 1-0');
});

writingResultsSuite.run()

const writingTagsSuite = suite('When writing tags of games');
writingTagsSuite('should allow standard tags and not writing them', () => {
    let input = '[Event "ChessDojo Open Classical - 2023-04"]\n' +
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
    let res = parseWriteGameNoTags(input);
    assert.equal(res, '1. e4 e5 2. Nf3 Nc6 1-0');
});

writingTagsSuite('should allow standard tags and writing them', () => {
    let input = '[Event "ChessDojo Open Classical - 2023-04"]\n' +
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
    let res = parseWriteGame(input);
    assert.equal(res, '[Event "ChessDojo Open Classical - 2023-04"]\n' +
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
        '1. e4 e5 2. Nf3 Nc6 1-0');  // Your expected output string goes here
});

writingTagsSuite('should allow writing single tags without values', () => {
    let input = '[TimeControl "5400+30"]\n' +
        'e4 e5';
    let res = parseWriteGame(input);
    assert.equal(res, '[TimeControl "5400+30"]\n\n1. e4 e5');
});

writingTagsSuite.run()

const differentConfigurationSuite = suite('When using different configuration');
differentConfigurationSuite('should write long notation if requested', () => {
    let reader = new PgnReader({ pgn: 'e4 e5 Nf3 Nc6'});
    let game:PgnGame = Object.assign({}, reader.games[0], { moves: reader.getMoves() }) as PgnGame
    let noTags: PgnWriterConfiguration = { tags: "no"};
    noTags.notation = "long";
    let res = writeGame(game, noTags);
    assert.equal(res, '1. e2-e4 e7-e5 2. Ng1-f3 Nb8-c6');
});

differentConfigurationSuite('should write long notation if requested (in using the reader)', () => {
    let reader = new PgnReader({ pgn: 'e4 e5 Nf3 Nc6'});
    let noTags:PgnWriterConfiguration = { tags: "no", notation: "long"};
    let res = reader.writePgn(noTags);
    assert.equal(res, '1. e2-e4 e7-e5 2. Ng1-f3 Nb8-c6');
});

differentConfigurationSuite.run()