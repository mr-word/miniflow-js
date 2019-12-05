const debug = require('debug')('miniflow')
const h2ab = require('hex-to-array-buffer')
const ab2h = require('array-buffer-to-hex')
const rlp = require('rlp')
const BN = require('bn.js')
const bn = (n) => new BN(n)

const { hash } = require('../src/crypto.js')
const { merkelize } = require('../src/merkle.js')

class WireType {
  static fromRLP (L) {
    throw new TypeError('tried to instantiate (fromRLP/fromBytes) an abstract type - WireType should be extended)')
  }

  static fromBytes (bytes) {
    return this.fromRLP(rlp.decode(bytes))
  }

  hashID () {
    return ab2h(hash(this.serialize()))
  }

  serialize () {
    return rlp.encode(this.listify())
  }

  listify () {
    throw new TypeError('tried to listify an abstract type  - WireType should be extended)')
  }
}

class Output extends WireType {
  constructor (args) {
    super()
    this.left = bn(args.left)
    this.right = bn(args.right)
    this.data = args.data
    this.quorum = bn(args.quorum)
    this.pubkeyidx = args.pubkeyidx.map(bn)
  }

  listify () {
    return [
      this.left.toBuffer(),
      this.right.toBuffer(),
      this.data,
      this.quorum.toBuffer(),
      this.pubkeyidx.map((n) => n.toBuffer())
    ]
  }

  hashID () {
    throw new TypeError("Don't use hashID for outputs, use (txID,idx)")
  }

  static fromJSON (obj) {
    return new Output({
      left: bn(obj.left),
      right: bn(obj.right),
      data: obj.data,
      quorum: obj.quorum,
      pubkeyidx: obj.pubkeyidx
    })
  }

  static fromRLP (L) {
    return new Output({
      left: bn(L[0]),
      right: bn(L[1]),
      data: L[2],
      quorum: bn(L[3]),
      pubkeyidx: L[4].map(bn)
    })
  }
}

class Input extends WireType {
  constructor (args) {
    super()
    this.actionHash = args.action
    this.outputIndex = bn(args.index)
  }

  listify () {
    return [
      Buffer(h2ab(this.actionHash)),
      this.outputIndex.toBuffer()
    ]
  }

  static fromRLP (L) {
    return new Input({
      action: ab2h(L[0]),
      index: bn(L[1])
    })
  }
}

class Action extends WireType {
  constructor (args) {
    super()
    this.confirmHeader = args.confirmHeader
    this.validSince = bn(args.validSince)
    this.validUntil = bn(args.validUntil)
    this.inputs = args.inputs
    this.outputs = args.outputs
    this.pubkeys = args.pubkeys
    this.signatures = args.signatures
  }

  listify () {
    return [
      Buffer(h2ab(this.confirmHeader)),
      this.validSince.toBuffer(),
      this.validUntil.toBuffer(),
      this.inputs.map((x) => x.listify()),
      this.outputs.map((x) => x.listify()),
      this.pubkeys,
      this.signatures
    ]
  }

  getOutputTag (n) {
    return rlp.encode(this.hashID(), bn(n))
  }

  static fromRLP (L) {
    return new Action({
      confirmHeader: ab2h(L[0]),
      validSince: bn(L[1]),
      validUntil: bn(L[2]),
      inputs: L[3].map((x) => Input.fromRLP(x)),
      outputs: L[4].map((x) => Output.fromRLP(x)),
      pubkeys: L[5],
      signatures: L[6]
    })
  }
}

class Header extends WireType {
  constructor (args) {
    super()
    this.prev = args.prev
    this.prevTotalWork = args.prevTotalWork
    this.actroot = args.actroot
    this.miner = args.miner
    this.time = bn(args.time)
    this.work = args.work
  }

  listify () {
    return [
      Buffer(h2ab(this.prev)),
      this.prevTotalWork,
      Buffer(h2ab(this.actroot)),
      this.miner,
      this.time.toBuffer(),
      this.work
    ]
  }

  static fromRLP (L) {
    return new Header({
      prev: ab2h(L[0]),
      prevTotalWork: L[1],
      actroot: ab2h(L[2]),
      miner: L[3],
      time: bn(L[4]),
      work: L[5]
    })
  }
}

class Block extends WireType {
  constructor (args) {
    super()
    this.header = args.header
    this.actions = args.actions
  }

  listify () {
    return [
      this.header.listify(),
      this.actions.map((a) => a.listify())
    ]
  }

  static fromRLP (L) {
    return new Block({
      header: Header.fromRLP(L[0]),
      actions: L[1].map((a) => Action.fromRLP(a))
    })
  }

  remerk () {
    const txids = this.actions.map((a) => h2ab(a.hashID()))
    console.log(txids)
    this.header.actroot = ab2h(merkelize(txids))
  }

  hashID () {
    throw new Error("Don't hashID() a block; it is identified by header.hashID()")
  }
}

module.exports = {
  _WireType: WireType,
  Output,
  Input,
  Action,
  Header,
  Block
}
