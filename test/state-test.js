const want = require('chai').expect
const bang = require('../src/bang.js')
const crypto = require('../src/crypto.js')
const testkeypair = require('../test/crypto-test.js').testKeyPair()
const { Validator } = require('../src/validator.js')
const { State, BlockTree } = require('../src/state.js')

const ab2h = require('array-buffer-to-hex')
const ZERO = ab2h(new ArrayBuffer(32))

describe('state', () => {
  beforeEach(() => {
    v = new Validator()
    bt = new BlockTree(v)
  })
  it('init with minibang', () => {
    bt.forceInsert(bang, ZERO)
    s = bt.checkout(bang.header.hashID())
    const HEADERHASH = Buffer(32).fill(7)
    s.addUTXO(['txid', 'idx'])
    s.pushHeader(HEADERHASH)
    s.commit()
    want(bt.isUnspent(HEADERHASH, 'txid', 'idx'), 'fresh txo not in utxo after commit')
    want(bt.latest == HEADERHASH, 'pushed header not latest after commit')
  })
})
