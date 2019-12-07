const BN = require('bn.js')
const want = require('chai').expect
const h2ab = require('hex-to-array-buffer')
const ab2h = require('array-buffer-to-hex')
const debug = require('debug')('miniflow:miner')

const { hash } = require('../src/crypto.js')
const { Header } = require('../src/data.js')
const miner = require('../src/miner.js')

const OVER256 = (new BN(2)).pow(new BN(256))
const difficulty = OVER256.div(new BN(2 ** 8))

describe('miner', () => {
  it('mines to a difficulty', () => {
    const data = '1'.repeat(64)
    const fuzz = miner.work(data, difficulty)
    const pow = Buffer.concat([Buffer.from(data, 'hex'), fuzz])
    want(new BN(pow).lt(difficulty), 'returned pow does not beat difficulty')
  })
  it('mines a header mixhash', () => {
    const header = Header.fromJSON({
      prev: '',
      actroot: '',
      xtrs: '',
      miner: '',
      time: 0,
      fuzz: '',
      work: ''
    })
    const mix = header.mixHash()
    const checkmix = ab2h(hash(Buffer.concat([
      Buffer.from(header.prev, 'hex'),
      Buffer.from(header.actroot, 'hex'),
      Buffer.from(header.xtrs, 'hex'),
      Buffer.from(header.miner, 'hex'),
      Buffer.from(header.time.toBuffer(), 'hex')
    ])))
    want(mix == checkmix, 'wrong computed mixhash')
    const fuzz = miner.work(mix, difficulty)
    debug('fuzz ' + fuzz.toString('hex'))
    const workload = Buffer.concat([Buffer.from(checkmix, 'hex'), fuzz])
    debug('workload  ' + workload.toString('hex'))
    const pow = hash(workload)
    debug('pow  ' + pow.toString('hex'))
  })
})
