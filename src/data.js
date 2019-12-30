const debug = require('debug')('miniflow:data')

const rlp = require('rlp')
const h2ab = require('hex-to-array-buffer')
const ab2h = require('array-buffer-to-hex')
const BN = require('BN.js')

const { hash } = require('../src/crypto.js')
const { merkelize } = require('../src/merkle.js')

class Varnum extends BN {
  toHex () {
    return this.toBuffer().toString('hex')
  }

  static fromHex (hex) {
    return Varnum.from(hex, 'hex')
  }

  static fromBuffer (buffer) {
    if (buffer.length > 32) {
      throw new Error(`Varnum.fromBuffer got buffer.length > 32: buffer: ${buffer}`)
    }
    return new Varnum(Buffer.from(buffer))
  }
}

class MiniData {
  static fromBytes (bytes) {
    return this.fromPreRLP(rlp.decode(bytes))
  }

  static fromPreRLP (list) {
    throw new Error('tried to instantiate (fromBytes/fromPreRLP) abstract class MiniData')
  }

  toBytes () {
    return rlp.encode(this.toPreRLP())
  }

  toPreRLP () {
    throw new Error('tried to toRLP abstract class MiniData')
  }
}

// UTXO tag
// [actID,idx]
class UTag extends MiniData {
  toJSON () {
    return {
      action: ab2h(this.action),
      index: ab2h(this.index)
    }
  }

  toPreRLP () {
    return [
      this.action,
      this.index
    ]
  }

  static fromJSON (obj) {
    // debug('UTag.fromJSON %O', obj)
    const input = new Input()
    input.action = Buffer.from(obj.action, 'hex'),
    input.index = (new BN(obj.index)).toBuffer()
    return input
  }

  static fromPreRLP (list) {
    // debug('UTag.fromPreRLP %O', list)
    return this.fromJSON({
      action: list[0].toString('hex'),
      index: new BN(list[1].toString('hex'), 16)
    })
  }
}

class Input extends UTag {}

class Output extends MiniData {
  toJSON () {
    return {
      left: ab2h(this.left),
      right: ab2h(this.right),
      data: ab2h(this.data),
      quorum: ab2h(this.quorum),
      pubkeys: this.pubkeys.map(ab2h)
    }
  }

  toPreRLP () {
    return [
      Buffer(this.left),
      Buffer(this.right),
      Buffer(this.data),
      Buffer(this.quorum),
      this.pubkeys.map((x) => Buffer(x))
    ]
  }

  static fromJSON (obj) {
    const output = new Output()
    output.left = h2ab(obj.left)
    output.right = h2ab(obj.right)
    output.data = h2ab(obj.data)
    output.quorum = h2ab(obj.quorum)
    output.pubkeys = obj.pubkeys.map(h2ab)
    return output
  }

  static fromPreRLP (list) {
    return this.fromJSON({
      left: ab2h(list[0]),
      right: ab2h(list[1]),
      data: ab2h(list[2]),
      quorum: ab2h(list[3]),
      pubkeys: list[4].map(ab2h)
    })
  }
}

class Action extends MiniData {
  hashID () {
    return ab2h(hash(this.toBytes()))
  }

  toJSON () {
    return {
      validSince: ab2h(this.validSince),
      validUntil: ab2h(this.validUntil),
      inputs: this.inputs.map((i) => i.toJSON()),
      outputs: this.outputs.map((o) => o.toJSON()),
      signatures: this.signatures.map(ab2h),
      extraData: ab2h(this.extraData)
    }
  }

  toPreRLP () {
    return [
      this.validSince,
      this.validUntil,
      this.inputs.map((i) => i.toPreRLP()),
      this.outputs.map((o) => o.toPreRLP()),
      this.signatures.map((s) => Buffer(s)),
      this.extraData
    ]
  }

  static fromJSON (obj) {
    // debug('Action.fromJSON %O', obj)
    const action = new Action()
    action.validSince = Buffer.from(obj.validSince, 'hex')
    action.validUntil = Buffer.from(obj.validUntil, 'hex')
    action.inputs = obj.inputs.map((i) => Input.fromJSON(i))
    action.outputs = obj.outputs.map((o) => Output.fromJSON(o))
    action.signatures = obj.signatures.map((s) => Buffer.from(s, 'hex'))
    action.extraData = Buffer.from(obj.extraData, 'hex')
    return action
  }

  static fromPreRLP (list) {
    // debug('Action.fromPreRLP %O', list)
    return this.fromJSON({
      validSince: ab2h(list[0]),
      validUntil: ab2h(list[1]),
      inputs: list[2].map((i) => Input.fromPreRLP(i).toJSON()),
      outputs: list[3].map((o) => Output.fromPreRLP(o).toJSON()),
      signatures: list[4].map(ab2h),
      extraData: ab2h(list[5])
    })
  }
}

class Header extends MiniData {
  hashID () {
    return ab2h(hash(Buffer.concat([Buffer.from(this.mixHash(), 'hex'), Buffer.from(this.fuzz)])))
  }

  mixHash () {
    return ab2h(hash(Buffer.concat([
      Buffer(this.prev),
      Buffer(this.root),
      Buffer(this.xtrs),
      Buffer(this.node),
      Buffer(this.time)
    ])))
  }

  toJSON () {
    return {
      prev: ab2h(this.prev),
      root: ab2h(this.root),
      xtrs: ab2h(this.xtrs),
      node: ab2h(this.node),
      time: ab2h(this.time),
      fuzz: ab2h(this.fuzz)
    }
  }

  toPreRLP () {
    return [
      Buffer(this.prev),
      Buffer(this.root),
      Buffer(this.xtrs),
      Buffer(this.node),
      Buffer(this.time),
      Buffer(this.fuzz)
    ]
  }

  static fromJSON (obj) {
    // debug('Header.fromJSON %O', obj)
    const header = new Header()
    header.prev = h2ab(obj.prev)
    header.root = h2ab(obj.root)
    header.xtrs = h2ab(obj.xtrs)
    header.node = h2ab(obj.node)
    header.time = h2ab(obj.time)
    header.fuzz = h2ab(obj.fuzz)
    return header
  }

  static fromPreRLP (list) {
    // debug('Header.fromPreRLP %O', list)
    return this.fromJSON({
      prev: ab2h(list[0]),
      root: ab2h(list[1]),
      xtrs: ab2h(list[2]),
      node: ab2h(list[3]),
      time: ab2h(list[4]),
      fuzz: ab2h(list[5])
    })
  }
}

class Block extends MiniData {
  remerk () {
    if (this.actions.length == 0) {
      this.header.root = Buffer.from([])
    } else {
      const actIDs = this.actions.map((a) => h2ab(a.hashID()))
      this.header.root = merkelize(actIDs)
    }
    return this
  }

  toJSON () {
    return {
      header: this.header.toJSON(),
      actions: this.actions.map((a) => a.toJSON())
    }
  }

  toPreRLP () {
    return [
      this.header.toPreRLP(),
      this.actions.map((a) => a.toPreRLP())
    ]
  }

  static fromJSON (obj) {
    // debug('Block.fromJSON %O', obj)
    const block = new Block()
    block.header = Header.fromJSON(obj.header)
    block.actions = obj.actions.map((a) => Action.fromJSON(a))
    return block
  }

  static fromPreRLP (list) {
    // debug('Block.fromPreRLP %O', list)
    return this.fromJSON({
      header: Header.fromPreRLP(list[0]).toJSON(),
      actions: list[1].map((a) => Action.fromPreRLP(a).toJSON())
    })
  }
}

module.exports = { Varnum, Input, Output, Action, Header, Block }
