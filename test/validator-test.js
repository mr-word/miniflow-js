const immutable = require('immutable')
const { BlockTree } = require('../src/blocktree.js')
const { Validator, ValidationError } = require('../src/validator.js')
const want = require('chai').expect
const bang = require('../src/bang')
const { block1 } = require('../test/blocks.js')

const h2ab = require('hex-to-array-buffer')

describe('validator', () => {
  beforeEach(() => {
    time = 0
    v = new Validator(() => time)
    b = new BlockTree(bang)
  })
  it('test block1 basic', () => {
    s = b.checkout(bang.header.hashID())
    s = v.evaluate(s, block1)
  })
  it('test block1 nomerk', () => {
    s = b.checkout(bang.header.hashID())
    block1.header.root = h2ab('')
    want(() => v.evaluate(s, block1)).to.throw(ValidationError)
  })
})
