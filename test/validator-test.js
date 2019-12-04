const want = require('chai').expect
const bang = require('../src/bang.js')
const crypto = require('../src/crypto.js')
const testkeypair = require('../test/crypto-test.js').testKeyPair()
const { Validator } = require('../src/validator.js')
const { Producer } = require('../src/producer.js')
const { State, BlockTree } = require('../src/state.js')

describe('validator', () => {
  beforeEach(() => {
    v = new Validator()
    bt = new BlockTree(v)
    p = new Producer(s, testkeypair)
  })
  it('init with minibang', () => {
    bt.init(bang)
  })
  it('mine a block', () => {
    bt.init(bang)
  })
})
