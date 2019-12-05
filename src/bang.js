const data = require('../src/data.js')
const BN = require('bn.js')
const ab2h = require('array-buffer-to-hex')

const ZERO = '0'.repeat(64)
bn2hex = (bn) => ab2h(bn.toBuffer())
n2hex = (n) => bn2hex(new BN(n))


const blk0act0 = {
    confirmHeader: ZERO,
    validSince: n2hex(0),
    validUntil: n2hex(0),
    signatures: [],
    inputs: [],
    outputs: [],
    extraData: ZERO
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

const block = data.Block.fromJSON(blk0);
block.remerk();

module.exports = block;
