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
    bt.checkout(ZERO)
    bt.addHeader(bang.header)
    bt.addUTXO('TXID', 0)
    bt.addUTXO('TXID', 1)
    bt.delUTXO('TXID', 1)
    bt.commit(BANG)

    bt.checkout(BANG)
    want(bt.isUnspent('TXID', 0)).true
    want(bt.isUnspent('TXID', 0)).true
    want(bt.isUnspent('TXID', 1)).false
    bt.close()

    bt.checkout(BANG)
    bt.delUTXO('TXID', 0)
    bt.commit('1'.repeat(64))

    bt.checkout('1'.repeat(64))
    want(bt.isUnspent('TXID', 0)).false
    want(bt.isUnspent('TXID', 1)).false

    want(bt.isUnspent('TXID', 0, BANG)).true
    want(bt.isUnspent('TXID', 1, BANG)).false
  })

  it('insertBlock', () => {
    const s1 = bt.insertBlock(bang)

    bt.checkout(BANG)
    want(bt.hasHeader(BANG)).true
    want(bt.isUnspent(bang.actions[0].hashID(), 0)).false
    want(bt.isUnspent(bang.actions[0].hashID(), 1)).true
  })
})
