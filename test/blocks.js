const { Block, Varnum } = require('../src/data.js')
const { hash } = require('../src/crypto.js')
const keypair = require('../test/crypto-test.js').testKeyPair()
const block0 = require('../src/bang.js')
const miner = require('../src/miner.js')
const ab2h = require('array-buffer-to-hex')
const h2ab = require('hex-to-array-buffer')
const BN = require('bn.js')

const block1 = Block.fromJSON({
  header: {
    prev: block0.header.hashID(),
    root: 'remerk',
    xtrs: '',
    node: ab2h(Buffer(keypair.publicKey)),
    time: new Varnum(Date.now()).toHex(),
    fuzz: '',
    work: 'rework'
  },
  actions: [{
    validSince: '00',
    validUntil: '00',
    inputs: [],
    outputs: [],
    signatures: [],
    extraData: ''
  }]
}).remerk()

const fuzz = miner.work(block1.header.mixHash(), (new BN(2)).pow(new BN(256 - 8)))
const work = hash(Buffer.concat([Buffer.from(block1.header.mixHash(), 'hex'), Buffer.from(fuzz, 'hex')]))
block1.header.fuzz = Buffer.from(fuzz, 'hex')
block1.header.work = work
module.exports = { block1 }
