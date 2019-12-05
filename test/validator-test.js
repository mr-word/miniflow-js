const want = require('chai').expect
const bang = require('../src/bang.js')
const crypto = require('../src/crypto.js')
const testkeypair = require('../test/crypto-test.js').testKeyPair()
const { Validator } = require('../src/validator.js')
const { State, BlockTree } = require('../src/state.js')

const ab2h = require('array-buffer-to-hex')
const ZERO = ab2h(new ArrayBuffer(32))

describe('validator', () => {
  beforeEach(() => {
    v = new Validator()
    bt = new BlockTree(v)
  })
  it('init with minibang', () => {
    bt.forceInsert(bang, ZERO)
  })
  it('mine a block', () => {
    bt.forceInsert(bang, ZERO)
  })
})
