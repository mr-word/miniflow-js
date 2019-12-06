const want = require('chai').expect
const bang = require('../src/bang.js')
const crypto = require('../src/crypto.js')
const testkeypair = require('../test/crypto-test.js').testKeyPair()

const { BlockTree } = require('../src/blocktree.js')

const ab2h = require('array-buffer-to-hex')
const ZERO = ab2h(new ArrayBuffer(32))
const BANG = bang.header.hashID()

describe('blocktree', () => {
  var bt
  beforeEach(() => {
    bt = new BlockTree()
  })
  it('basics', () => {
    let s = bt.checkout(ZERO)
    s.addHeader(bang.header)
    s.addUTXO('TXID', 0)
    s.addUTXO('TXID', 1)
    s.delUTXO('TXID', 1)
    bt.commit(BANG, s)

    s = bt.checkout(BANG)
    want(s.isUnspent('TXID', 0)).true
    want(s.isUnspent('TXID', 0)).true
    want(s.isUnspent('TXID', 1)).false

    s.delUTXO('TXID', 0)
    bt.commit('1'.repeat(64), s)

    s = bt.checkout('1'.repeat(64))
    want(s.isUnspent('TXID', 0)).false
    want(s.isUnspent('TXID', 1)).false

    s = bt.checkout(BANG)
    want(s.isUnspent('TXID', 0, BANG)).true
    want(s.isUnspent('TXID', 1, BANG)).false
  })

  it('insertBlock', () => {
    const s0 = bt.checkout(ZERO)
    s0.insertBlock(bang)
    bt.commit(BANG, s0)

    const s1 = bt.checkout(BANG)
    want(s1.hasHeader(BANG)).true
    want(s1.isUnspent(bang.actions[0].hashID(), 0)).false
    want(s1.isUnspent(bang.actions[0].hashID(), 1)).true
  })
})
