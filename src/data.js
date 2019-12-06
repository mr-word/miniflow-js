const debug = require('debug')('miniflow:data')
const BN = require('BN.js')
const rlp = require('rlp')
const h2ab = require('hex-to-array-buffer')
const ab2h = require('array-buffer-to-hex')
const { hash } = require('../src/crypto.js')
const { merkelize } = require('../src/merkle.js')

class MiniData {
  static fromBytes (bytes) {
    return this.fromNestedList(rlp.decode(bytes))
  }

  static fromNestedList (list) {
    throw new Error('tried to instantiate (fromBytes/fromNestedList) abstract class MiniData')
  }

  toBytes () {
    return rlp.encode(this.listify())
  }

  listify () {
    throw new Error('tried to toRLP abstract class MiniData')
  }
}

class Output extends MiniData {
  toJSON () {
    return {
      left: ab2h(this.left.toBuffer()),
      right: ab2h(this.right.toBuffer()),
      data: ab2h(this.data),
      lockQuorum: ab2h(this.lockQuorum.toBuffer()),
      needQuorum: ab2h(this.needQuorum.toBuffer()),
      keyQuorum: ab2h(this.keyQuorum.toBuffer()),
      locks: this.locks.map(ab2h),
      needs: this.needs.map(ab2h),
      pubkeys: this.pubkeys.map(ab2h)
    }
  }

  listify () {
    return [
      this.left.toBuffer(),
      this.right.toBuffer(),
      Buffer(this.data),
      this.lockQuorum.toBuffer(),
      this.needQuorum.toBuffer(),
      this.keyQuorum.toBuffer(),
      this.locks.map((x) => Buffer(x)),
      this.needs.map((x) => Buffer(x)),
      this.pubkeys.map((x) => Buffer(x))
    ]
  }

  static fromJSON (obj) {
    const output = new Output()
    output.left = new BN(obj.left)
    output.right = new BN(obj.right)
    output.data = h2ab(obj.data)
    output.lockQuorum = new BN(obj.lockQuorum)
    output.needQuorum = new BN(obj.needQuorum)
    output.keyQuorum = new BN(obj.keyQuorum)
    output.locks = obj.locks.map(h2ab)
    output.needs = obj.needs.map(h2ab)
    output.pubkeys = obj.pubkeys.map(h2ab)
    return output
  }

  static fromNestedList (list) {
    return this.fromJSON({
      left: new BN(list[0]),
      right: new BN(list[1]),
      data: ab2h(list[2]),
      lockQuorum: new BN(list[3]),
      needQuorum: new BN(list[4]),
      keyQuorum: new BN(list[5]),
      locks: list[6].map(ab2h),
      needs: list[7].map(ab2h),
      pubkeys: list[8].map(ab2h)
    })
  }
}

class Input extends MiniData {
  toJSON () {
    return {
      action: ab2h(this.action),
      index: ab2h(this.index.toBuffer())
    }
  }

  listify () {
    return [
      Buffer(this.action),
      this.index.toBuffer()
    ]
  }

  static fromJSON (obj) {
    debug('Input.fromJSON %O', obj)
    const input = new Input()
    input.action = h2ab(obj.action),
    input.index = new BN(obj.index)
    return input
  }

  static fromNestedList (list) {
    debug('Input.fromNestedList %O', list)
    return this.fromJSON({
      action: ab2h(list[0]),
      index: new BN(list[1])
    })
  }
}

class Action extends MiniData {
  hashID () {
    return ab2h(hash(this.toBytes()))
  }

  toJSON () {
    return {
      validSince: ab2h(this.validSince.toBuffer()),
      validUntil: ab2h(this.validUntil.toBuffer()),
      inputs: this.inputs.map((i) => i.toJSON()),
      outputs: this.outputs.map((o) => o.toJSON()),
      confirmHeader: ab2h(this.confirmHeader),
      signatures: this.signatures.map(ab2h),
      extraData: ab2h(this.extraData)
    }
  }

  listify () {
    return [
      this.validSince.toBuffer(),
      this.validUntil.toBuffer(),
      this.inputs.map((i) => i.listify()),
      this.outputs.map((o) => o.listify()),
      Buffer(this.confirmHeader),
      this.signatures.map((s) => Buffer(s)),
      Buffer(this.extraData)
    ]
  }

  static fromJSON (obj) {
    debug('Action.fromJSON %O', obj)
    const action = new Action()
    action.validSince = new BN(obj.validSince)
    action.validUntil = new BN(obj.validUntil)
    action.inputs = obj.inputs.map((i) => Input.fromJSON(i))
    action.outputs = obj.outputs.map((o) => Output.fromJSON(o))
    action.confirmHeader = h2ab(obj.confirmHeader)
    action.signatures = obj.signatures.map(h2ab)
    action.extraData = h2ab(obj.extraData)
    return action
  }

  static fromNestedList (list) {
    debug('Action.fromNestedList %O', list)
    return this.fromJSON({
      validSince: new BN(list[0]),
      validUntil: new BN(list[1]),
      inputs: list[2].map((i) => Input.fromNestedList(i).toJSON()),
      outputs: list[3].map((o) => Output.fromNestedList(o).toJSON()),
      confirmHeader: ab2h(list[4]),
      signatures: list[5].map(ab2h),
      extraData: ab2h(list[6])
    })
  }
}

class Header extends MiniData {
  hashID () {
    return ab2h(hash(this.toBytes()))
  }

  toJSON () {
    return {
      prev: ab2h(this.prev),
      prevTotalWork: ab2h(this.prevTotalWork.toBuffer()),
      actroot: ab2h(this.actroot),
      miner: ab2h(this.miner),
      time: ab2h(this.time.toBuffer()),
      work: ab2h(this.work)
    }
  }

  listify () {
    return [
      Buffer(this.prev),
      this.prevTotalWork.toBuffer(),
      Buffer(this.actroot),
      Buffer(this.miner),
      this.time.toBuffer(),
      Buffer(this.work)
    ]
  }

  static fromJSON (obj) {
    debug('Header.fromJSON %O', obj)
    const header = new Header()
    header.prev = h2ab(obj.prev)
    header.prevTotalWork = new BN(obj.prevTotalWork)
    header.actroot = h2ab(obj.actroot)
    header.miner = h2ab(obj.miner)
    header.time = new BN(obj.time)
    header.work = h2ab(obj.work)
    return header
  }

  static fromNestedList (list) {
    debug('Header.fromNestedList %O', list)
    return this.fromJSON({
      prev: ab2h(list[0]),
      prevTotalWork: new BN(list[1]),
      actroot: ab2h(list[2]),
      miner: ab2h(list[3]),
      time: new BN(list[4]),
      work: ab2h(list[5])
    })
  }
}

class Block extends MiniData {
  remerk () {
    const actIDs = this.actions.map((a) => h2ab(a.hashID()))
    this.header.actroot = ab2h(merkelize(actIDs))
    return this
  }

  toJSON () {
    return {
      header: this.header.toJSON(),
      actions: this.actions.map((a) => a.toJSON())
    }
  }

  listify () {
    return [
      this.header.listify(),
      this.actions.map((a) => a.listify())
    ]
  }

  static fromJSON (obj) {
    debug('Block.fromJSON %O', obj)
    const block = new Block()
    block.header = Header.fromJSON(obj.header)
    block.actions = obj.actions.map((a) => Action.fromJSON(a))
    return block
  }

  static fromNestedList (list) {
    debug('Block.fromNestedList %O', list)
    return this.fromJSON({
      header: Header.fromNestedList(list[0]).toJSON(),
      actions: list[1].map((a) => Action.fromNestedList(a).toJSON())
    })
  }
}

module.exports = { Input, Output, Action, Header, Block }
