const want = require('chai').expect
const bang = require('../src/bang.js')
const crypto = require('../src/crypto.js')
const testkeypair = require('../test/crypto-test.js').testKeyPair()
const { Validator } = require('../src/validator.js')
const { Producer } = require('../src/producer.js')
const { State, BlockTree } = require('../src/state.js')

describe('state', () => {
  beforeEach(() => {
    v = new Validator()
    bt = new BlockTree(v)
  })
  it('init with minibang', () => {
    bt.init(bang)
    s = bt.checkout(bang.header.hashID())
    let HEADERHASH = Buffer(32).fill(7)
    s.addUTXO(['txid','idx'])
    s.pushHeader(HEADERHASH)
    bt.commit(HEADERHASH, s)
    want(bt.isUnspent(HEADERHASH, ['txid','idx']), 'fresh txo not in utxo after commit')
    want(bt.latest == HEADERHASH, 'pushed header not latest after commit')
  })

})
