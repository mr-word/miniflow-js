const rlp = require('rlp')
const BN = require('bn.js')
const bn = (n) => new BN(n)

const { hash } = require('../src/crypto.js')

class WireType {
  static fromRLP(L) {
    throw new TypeError('tried to instantiate (fromRLP/fromBytes) an abstract type - WireType should be extended)')
  }

  static fromBytes (bytes) {
    return this.fromRLP(rlp.decode(bytes))
  }

  hashID () {
    return hash(this.serialize())
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

  static fromRLP(L) {
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
      this.actionHash,
      this.outputIndex.toBuffer()
    ]
  }

  static fromRLP(L) {
    return new Input({
      action: L[0],
      index: bn(L[1]),
    });
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
      this.confirmHeader,
      this.validSince.toBuffer(),
      this.validUntil.toBuffer(),
      this.inputs.map((x) => x.listify()),
      this.outputs.map((x) => x.listify()),
      this.pubkeys,
      this.signatures
    ]
  }

  static fromRLP(L) {
    console.log(L)
    return new Action({
        confirmHeader: L[0],
        validSince: bn(L[1]),
        validUntil: bn(L[2]),
        inputs: L[3].map((x)=>Input.fromRLP(x)),
        outputs: L[4].map((x)=>Output.fromRLP(x)),
        pubkeys: L[5],
        signatures: L[6],
    })
  }
}

class Header extends WireType {
  constructor (args) {
    super()
    this.prev = args.prev
    this.actroot = args.actroot
    this.miner = args.miner
    this.time = bn(args.time)
    this.work = args.work
  }

  listify () {
    return [
      this.prev,
      this.actroot,
      this.miner,
      this.time.toBuffer(),
      this.work
    ]
  }

  static fromRLP(L) {
    return new Header({
      prev: L[0],
      actroot: L[1],
      miner: L[2],
      time: bn(L[3]),
      work: L[4],
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
    console.log(this)
    return [
      this.header.listify(),
      this.actions.map((a) => a.listify())
    ]
  }

  static fromRLP(L) {
    return new Block({
      header: Header.fromRLP(L[0]),
      actions: L[1].map((a)=>Action.fromRLP(a)),
    })
  }
}

// ValidationContext is defined implicitly by consensus validation rules.
// It is defined here explicitly to help implementation authors.
// Listify contains UTXO, but not past headers or transactions.
class ValidationContext extends WireType {
  constructor () {
    this.header // for header in chain...
    this.currentAction // for action in header...
    this.currentInput // for input in action...
    this.inputAction // validate (currentAction,currentInput,inputAction)

    this.ADHT = {} // action DHT :: txHash -> tx
    this.BDHT = {} // block DHT :: headerHash -> header
    this.UTXO = {} // UTXO set :: (txHash,index) -> true | null
  }

  listify () {
    return [
      this.header.listify(), // wiretype
      this.currentTx.listify(), // wiretype
      this.currentOutputIndex, // varint
      this.currentInputTx.listify(), // wiretype
      this.UTXO.flatten() // serialized set, not a wiretype
    ]
  }
}

module.exports = {
  _WireType: WireType,
  Output,
  Input,
  Action,
  Header,
  Block,
  ValidationContext
}
