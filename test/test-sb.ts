const should = require('chai').should()
import {StringBuilder} from "../src"
import {describe} from "mocha"

describe("Base functionality of StringBuilder", function (){
    it("should be able to create an empty StringBuilder", function (){
        let sb = new StringBuilder("")
        should.equal(sb.toString(), '')
    })
    it ("should be able to create a StringBuilder from a string", function () {
        let sb = new StringBuilder('Hello world')
        should.equal(sb.toString(), "Hello world")
    })
    it( "should be able to append one or more strings to a StringBuilder", function () {
        let sb = new StringBuilder('1')
        sb.append('234')
        sb.append('567')
        should.equal(sb.toString(), "1234567")
    })
    it( "should be able to append different kind of objects to a StringBuilder", function () {
        let sb = new StringBuilder('hello')
        sb.append("test").append('23').append('onemore').append(5)
        should.equal(sb.toString(), 'hellotest23onemore5')
    })
})