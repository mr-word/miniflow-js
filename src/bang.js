const data = require('../src/data.js')
const BN = require('bn.js')
const ab2h = require('array-buffer-to-hex')
const h2ab = require('hex-to-array-buffer')
const { hash } = require('../src/crypto.js')
const debug = require('debug')('miniflow:data')

const ZERO = '0'.repeat(64)
bn2hex = (bn) => ab2h(bn.toBuffer())
n2hex = (n) => bn2hex(new BN(n))

const in0 = {
  action: '',
  index: 0
}

const out0 = {
  left: '00',
  right: '00',
  data: '',
  lockQuorum: 0,
  needQuorum: 0,
  keyQuorum: 0,
  locks: [],
  needs: [],
  pubkeys: []
}
const out1 = {
  left: '00',
  right: '01',
  data: '',
  lockQuorum: 0,
  needQuorum: 0,
  keyQuorum: 0,
  locks: [],
  needs: [],
  pubkeys: []
}
const out2 = {
  left: '01',
  right: 'f'.repeat(64),
  data: '',
  lockQuorum: 0,
  needQuorum: 0,
  keyQuorum: 0,
  locks: [],
  needs: [],
  pubkeys: []
}

const act0 = {
  validSince: '',
  validUntil: '',
  inputs: [in0],
  outputs: [out0, out1, out2],
  confirmHeader: '',
  signatures: [],
  extraData: ''
}

const hdr0 = {
  prev: '',
  actroot: '',
  xtrs: '',
  miner: '',
  time: '',
  fuzz: '',
  work: 'f'.repeat(64)
}

const blk0 = {
  header: hdr0,
  actions: [act0]
}

const block = data.Block.fromJSON(blk0)
block.remerk()
const bangwork = ab2h(hash(Buffer(h2ab(block.header.mixHash() + hdr0.miner + hdr0.fuzz)))) // TODO fix
debug(`bangwork ${bangwork}`)
block.work = bangwork

module.exports = block
