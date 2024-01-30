import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { StringBuilder } from "../src";

test('should be able to create an empty StringBuilder', () => {
    let sb = new StringBuilder("");
    assert.equal(sb.toString(), '');
});

test('should be able to create a StringBuilder from a string', () => {
    let sb = new StringBuilder('Hello world');
    assert.equal(sb.toString(), "Hello world");
});

test('should be able to append one or more strings to a StringBuilder', () => {
    let sb = new StringBuilder('1');
    sb.append('234');
    sb.append('567');
    assert.equal(sb.toString(), "1234567");
});

test('should be able to append different kind of objects to a StringBuilder', () => {
    let sb = new StringBuilder('hello');
    sb.append("test").append('23').append('onemore').append(5);
    assert.equal(sb.toString(), 'hellotest23onemore5');
});

test.run();