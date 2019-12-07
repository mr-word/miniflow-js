const { Block } = require('../src/data.js')

const keypair = require('../test/crypto-test.js').testKeyPair()
const block0 = require('../src/bang.js')
const ab2h = require('array-buffer-to-hex')
const ZERO = '0'.repeat(64)

const block1 = Block.fromJSON({
  header: {
    prev: block0.header.hashID(),
    prevTotalWork: 1,
    actroot: ZERO, // .remerk()
    miner: ab2h(Buffer(keypair.publicKey)),
    time: Date.now(),
    fuzz: '',
    work: '7' + 'f'.repeat(63) // .work()
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
