const want = require('chai').expect
const bang = require('../src/bang.js')
const crypto = require('../src/crypto.js')
const testkeypair = require('../test/crypto-test.js').testKeyPair()
const BN = require('bn.js')

const { BlockTree } = require('../src/blocktree.js')

const ab2h = require('array-buffer-to-hex')
const h2ab = require('hex-to-array-buffer')
const BANG = bang.header.hashID()

describe('blocktree', () => {
  var bt
  beforeEach(() => {
    bt = new BlockTree(bang)
  })

  it('insertBlock', () => {
    const s1 = bt.checkout(BANG)
    want(s1.hasHeader(BANG)).true
    want(s1.isUnspent(bang.actions[0].hashID(), (new BN(0)).toBuffer().toString('hex'))).false
    want(s1.isUnspent(bang.actions[0].hashID(), (new BN(1)).toBuffer().toString('hex'))).true
  })
})
