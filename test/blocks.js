const { Block } = require('../src/data.js')

const keypair = require('../test/crypto-test.js').testKeyPair()
const block0 = require('../src/bang.js')
const ab2h = require('array-buffer-to-hex')

const block1 = Block.fromJSON({
    header: {
        prev: block0.header.hashID(),
        prevTotalWork: 0,
        actroot: '', // .remerk()
        miner: ab2h(Buffer(keypair.publicKey)),
        time: Date.now(),
        fuzz: '',
        work: '' // .work()
    },
    actions: [{
        validSince: 0,
        validUntil: 0,
        inputs: [],
        outputs: [],
        confirmHeader: '',
        locks: [],
        signatures: [],
        extraData: ''
    }]
}).remerk();

module.exports = { block1 }
