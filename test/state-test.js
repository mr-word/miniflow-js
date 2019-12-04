const want = require('chai').expect
const bang = require('../src/bang.js')
const crypto = require('../src/crypto.js')
const testkeypair = require('../test/crypto-test.js').testKeyPair()
const { Validator } = require('../src/validator.js')
const { Producer } = require('../src/producer.js')
const { State, MultiState } = require('../src/state.js')

describe('state', () => {
  beforeEach(() => {
    v = new Validator()
    ms = new MultiState(v)
  })
  it('init with minibang', () => {
    ms.init(bang)
    s = ms.checkout(bang.header.hashID())
    let HEADERHASH = Buffer(32).fill(7)
    s.addUTXO(['txid','idx'])
    s.pushHeader(HEADERHASH)
    ms.commit(HEADERHASH, s)
    want(ms.isUnspent(HEADERHASH, ['txid','idx']), 'fresh txo not in utxo after commit')
    want(ms.latest == HEADERHASH, 'pushed header not latest after commit')
  })

})
