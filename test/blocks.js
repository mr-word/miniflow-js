const { Block } = require('../src/data.js')
const { hash } = require('../src/crypto.js')
const keypair = require('../test/crypto-test.js').testKeyPair()
const block0 = require('../src/bang.js')
const miner = require('../src/miner.js')
const ab2h = require('array-buffer-to-hex')
const h2ab = require('hex-to-array-buffer')
const BN = require('bn.js')
const ZERO = '0'.repeat(64)

const block1 = Block.fromJSON({
  header: {
    prev: block0.header.hashID(),
    actroot: ZERO, // .remerk()
    xtrs: '',
    miner: ab2h(Buffer(keypair.publicKey)),
    time: Date.now(),
    fuzz: '',
    work: 'f'.repeat(64) // .work()
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

// const fuzz = miner.work(block1.header.mixHash(), (new BN(2)).pow(new BN(256-2)))
const fuzz = '0000000000000000000000000000000000000000000000000000016edeced1d0'
const work = hash(Buffer.concat([Buffer.from(block1.header.mixHash(), 'hex'), Buffer.from(fuzz, 'hex')]))
block1.header.fuzz = fuzz
block1.header.work = work
console.log('fuzz', fuzz.toString('hex'))
module.exports = { block1 }
