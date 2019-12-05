const mini = require('../src/wiretypes.js')

const ZERO = '0'.repeat(64)

const action = new mini.Action({
  confirmHeader: ZERO,
  validSince: 0,
  validUntil: 0,
  pubkeys: [],
  signatures: [],
  inputs: [
    new mini.Input({
      action: ZERO,
      index: 0
    }),
    new mini.Input({
      action: ZERO,
      index: 1
    })
  ],
  outputs: [
    new mini.Output({
      left: 0,
      right: 1,
      data: 0,
      quorum: 0,
      pubkeyidx: []
    }),
    new mini.Output({
      left: 1,
      right: 255,
      data: 0,
      quorum: 0,
      pubkeyidx: []
    })
  ]
})

const header = new mini.Header({
  prev: ZERO,
  actroot: ZERO,
  miner: 0,
  time: 0,
  work: 0
})

const block = new mini.Block({
  header: header,
  actions: [action]
})

block.remerk()

module.exports = block
