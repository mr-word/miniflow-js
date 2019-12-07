const { Block } = require('../src/data.js')

const keypair = require('../test/crypto-test.js').testKeyPair()
const block0 = require('../src/bang.js')
const ab2h = require('array-buffer-to-hex')
const ZERO = '0'.repeat(64)

const block1 = Block.fromJSON({
  header: {
    prev: block0.header.hashID(),
    actroot: ZERO, // .remerk()
    xtrs: '',
    miner: ab2h(Buffer(keypair.publicKey)),
    time: Date.now(),
    fuzz: '',
    work: 'e' + 'f'.repeat(63) // .work()
  },
  actions: [{
    validSince: 0,
    validUntil: 0,
    inputs: [],
    outputs: [],
    confirmHeader: '',
    signatures: [],
    extraData: ''
  }]
}).remerk()

module.exports = { block1 }
