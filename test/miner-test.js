const BN = require('bn.js')
const h2ab = require('hex-to-array-buffer')
const ab2h = require('array-buffer-to-hex')
const debug = require('debug')('miniflow:miner')

const { Header } = require('../src/data.js')
const miner = require('../src/miner.js')

let OVER256 = (new BN(2)).pow(new BN(256))
let difficulty = OVER256.div(new BN(2**8))

describe('miner', () =>{
  it('mines to a difficulty', ()=>{
    let data = '1'.repeat(64)
    let fuzz = miner.work(data, difficulty)    
  })
  it('mines a header mixhash', ()=>{
    let header = Header.fromJSON({
        prev: '',
        prevTotalWork: 0,
        actroot: '',
        miner: '',
        time: 0,
        fuzz: '',
        work: ''
    })
    let mix = header.mixHash()
    let fuzz = miner.work(mix, difficulty)
    debug('fuzz ' + fuzz.toString('hex'))
  })
})
