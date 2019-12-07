const data = require('../src/data.js')
const want = require('chai').expect
const ab2h = require('array-buffer-to-hex')
const BN = require('bn.js')

const debug = require('debug')('miniflow:tests')

bn2hex = (bn) => ab2h(bn.toBuffer())
n2hex = (n) => bn2hex(new BN(n))

const outputJSON = {
  left: n2hex(0),
  right: n2hex(1),
  data: 'daba',
  lockQuorum: n2hex(0),
  needQuorum: n2hex(0),
  keyQuorum: n2hex(2),
  locks: [],
  needs: [],
  pubkeys: []
}

const inputJSON = {
  action: 'accd',
  index: n2hex(0)
}

const actionJSON = {
  validSince: n2hex(0),
  validUntil: n2hex(1),
  inputs: [inputJSON],
  outputs: [outputJSON],
  requireHeader: '',
  signatures: ['b0bd55', 'cadf55'],
  extraData: 'e5dada' // NOT SIGNED - inserted/replaced by block producer
}

const headerJSON = {
  prev: '',
  actroot: '',
  xtrs: '',
  node: '',
  time: n2hex(1),
  fuzz: '',
  work: '00111111'
}

const blockJSON = {
  header: headerJSON,
  actions: [actionJSON]
}

describe('datatypes', () => {
  it('output', () => {
    const output = data.Output.fromJSON(outputJSON)
    want(output.toJSON()).deep.equal(outputJSON)
    const bytes = output.toBytes()
    const decoded = data.Output.fromBytes(bytes)
    want(decoded.toJSON()).deep.equal(output.toJSON())
  })
  it('input', () => {
    const input = data.Input.fromJSON(inputJSON)
    want(input.toJSON()).deep.equal(inputJSON)
    const bytes = input.toBytes()
    const decoded = data.Input.fromBytes(bytes)
    want(decoded.toJSON()).deep.equal(input.toJSON())
  })
  it('action', () => {
    const action = data.Action.fromJSON(actionJSON)
    want(action.toJSON()).deep.equal(actionJSON)
    const bytes = action.toBytes()
    const decoded = data.Action.fromBytes(bytes)
    want(action.toJSON()).deep.equal(actionJSON)
    want(decoded.toJSON()).deep.equal(action.toJSON())
  })
  it('header', () => {
    const header = data.Header.fromJSON(headerJSON)
    want(header.toJSON()).deep.equal(headerJSON)
    const bytes = header.toBytes()
    const decoded = data.Header.fromBytes(bytes)
    want(header.toJSON()).deep.equal(headerJSON)
    want(decoded.toJSON()).deep.equal(header.toJSON())
  })
  it('block', () => {
    const block = data.Block.fromJSON(blockJSON)
    want(block.toJSON()).deep.equal(blockJSON)
    const bytes = block.toBytes()
    const decoded = data.Block.fromBytes(bytes)
    want(block.toJSON()).deep.equal(blockJSON)
    want(decoded.toJSON()).deep.equal(block.toJSON())
  })
})

describe('buffers etc', () => {
  it('bignum serialized form (no varint)', () => {
    want((new BN(0)).toBuffer()).deep.equal(Buffer.from([0]))
    want((new BN(255)).toBuffer()).deep.equal(Buffer.from([255]))
    want((new BN(256)).toBuffer()).deep.equal(Buffer.from([1, 0]))
    const nums = [
      new BN(0),
      new BN(1),
      new BN(256),
      ((new BN(2)).pow(new BN(256))).sub(new BN(1)),
      (new BN(2)).pow(new BN(256))
    ]
    debug('%O', nums.map((n) => n.toArray()))
    const n255s = (new Buffer(32)).fill(255)
    const bn256m1 = (((new BN(2)).pow(new BN(256))).sub(new BN(1))).toArray()
    want(ab2h(n255s)).equal(ab2h(Buffer(bn256m1)))
  })
})
