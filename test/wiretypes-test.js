const mini = require('../src/wiretypes.js')
const want = require('chai').expect
const BN = require('bn.js')
const bn = (n) => new BN(n)

describe('mini wire types', () => {
  it('output', () => {
    const output = new mini.Output({
      left: 0,
      right: 256,
      data: new Buffer([0x42]),
      quorum: 2,
      pubkeyidx: [0, 1, 2]
    })
    const encoded = output.serialize()
    const decoded = mini.Output.fromBytes(encoded)
    want(output.listify()).deep.equal(decoded.listify())
  })

  it('input', () => {
    const output = new mini.Output({
      left: 0,
      right: 256,
      data: new Buffer([0x42]),
      quorum: 2,
      pubkeyidx: Array([0, 1, 2])
    })
    const fakeTrxHash = output.hashID()
    const input = new mini.Input({
        action: fakeTrxHash,
        index: 0
    });
    const encoded = input.serialize()
    const decoded = mini.Input.fromBytes(encoded)
    want(input.listify()).deep.equal(decoded.listify())
  })

  it('action', () => {
    const pubkeys = [Buffer('pubkey0'), Buffer('pubkey1'), Buffer('pubkey2')]
    const output = new mini.Output({
      left: 0,
      right: 256,
      data: new Buffer([0x42]),
      quorum: 2,
      pubkeyidx: Array([0, 1, 2])
    })
    const fakeTrxHash = output.hashID()
    const input = new mini.Input({
        action: fakeTrxHash,
        index: 0
    });
    const action = new mini.Action({
      confirmHeader: new Buffer('header'),
      validSince: 0,
      validUntil: 0,
      inputs: [input],
      outputs: [output],
      pubkeys: [pubkeys],
      extradata: new Buffer('DATA'),
      signatures: [new Buffer('sig1')]
    })

    const encoded = action.serialize()
    const decoded = mini.Action.fromBytes(encoded)
    want(action.listify()).deep.equal(decoded.listify())
  })

  it('header', () => {
    const header = new mini.Header({
      prev: Buffer('prev'),
      actroot: Buffer('root'),
      miner: Buffer('miner'),
      time: Buffer('time'),
      work: Buffer('work')
    })

    const encoded = header.serialize()
    const decoded = mini.Header.fromBytes(encoded)
    want(header.listify()).deep.equal(decoded.listify())
  })

  it('block', () => {
    const pubkeys = [Buffer('pubkey0'), Buffer('pubkey1'), Buffer('pubkey2')]
    const output = new mini.Output({
      left: 0,
      right: 256,
      data: new Buffer([0x42]),
      quorum: 2,
      pubkeyidx: [0, 1, 2]
    })
    console.log(output)
    const fakeTrxHash = output.hashID()
    const input = new mini.Input({
        action: fakeTrxHash,
        index: 0
    });
    const action = new mini.Action({
      confirmHeader: new Buffer('header'),
      validSince: 0,
      validUntil: 0,
      inputs: [input],
      outputs: [output],
      pubkeys: [pubkeys],
      extradata: new Buffer('DATA'),
      signatures: [new Buffer('sig1')]
    })
    const header = new mini.Header({
      prev: Buffer('prev'),
      actroot: Buffer('root'),
      miner: Buffer('miner'),
      time: Buffer('time'),
      work: Buffer('work')
    })


    const block = new mini.Block({
      header: header,
      actions: [action]
    })

    const encoded = block.serialize()
    const decoded = mini.Block.fromBytes(encoded)
    want(block.listify()).deep.equal(decoded.listify())
  })

  it('lang level type errors', () => {
    const wt = new mini._WireType()
    want(() => wt.serialize()).to.throw(TypeError)
  })
})
