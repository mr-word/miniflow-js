const data = require('../src/data.js')
const BN = require('bn.js')
const ab2h = require('array-buffer-to-hex')

const ZERO = '0'.repeat(64)
bn2hex = (bn) => ab2h(bn.toBuffer())
n2hex = (n) => bn2hex(new BN(n))

const in0 = {
  action: '',
  index: 0
}

const out0 = {
  left: 0,
  right: 0,
  data: '',
  quorum: 0,
  pubkeys: []
}
const out1 = {
  left: 0,
  right: 1,
  data: '',
  quorum: 0,
  pubkeys: []
}
const out2 = {
  left: 1,
  right: 7,
  data: '',
  quorum: 0,
  pubkeys: []
}

const blk0act0 = {
  validSince: n2hex(0),
  validUntil: n2hex(0),
  inputs: [in0],
  outputs: [out0, out1, out2],
  confirmHeader: '',
  locks: [],
  signatures: [],
  extraData: ''
}

const hdr0 = {
  prev: ZERO,
  prevTotalWork: n2hex(0),
  actroot: ZERO,
  miner: ZERO,
  time: n2hex(0),
  work: ZERO
}

const blk0 = {
  header: hdr0,
  actions: [blk0act0]
}

const block = data.Block.fromJSON(blk0)
block.remerk()

module.exports = block
