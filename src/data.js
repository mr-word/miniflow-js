const debug = require('debug')('miniflow:data')
const BN = require('BN.js')
const rlp = require('rlp')
const h2ab = require('hex-to-array-buffer')
const ab2h = require('array-buffer-to-hex')
const { hash } = require('../src/crypto.js')
const { merkelize } = require('../src/merkle.js')

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
    debug('UTag.fromJSON %O', obj)
    const input = new Input()
    input.action = Buffer.from(obj.action, 'hex'),
    input.index = (new BN(obj.index)).toBuffer()
    return input
  }

  static fromPreRLP (list) {
    debug('UTag.fromPreRLP %O', list)
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
      left: ab2h(this.left.toBuffer()),
      right: ab2h(this.right.toBuffer()),
      data: ab2h(this.data),
      lockQuorum: ab2h(this.lockQuorum.toBuffer()),
      needQuorum: ab2h(this.needQuorum.toBuffer()),
      keyQuorum: ab2h(this.keyQuorum.toBuffer()),
      locks: this.locks.map((utag) => utag.toJSON()),
      needs: this.needs.map((utag) => utag.toJSON()),
      pubkeys: this.pubkeys.map(ab2h)
    }
  }

  toPreRLP () {
    return [
      this.left.toBuffer(),
      this.right.toBuffer(),
      Buffer(this.data),
      this.lockQuorum.toBuffer(),
      this.needQuorum.toBuffer(),
      this.keyQuorum.toBuffer(),
      this.locks.map((utag) => utag.toPreRLP()),
      this.needs.map((utag) => utag.toPreRLP()),
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
    output.locks = obj.locks.map((utag) => UTag.fromJSON(utag))
    output.needs = obj.needs.map((utag) => UTag.fromJSON(utag))
    output.pubkeys = obj.pubkeys.map(h2ab)
    return output
  }

  static fromPreRLP (list) {
    return this.fromJSON({
      left: new BN(list[0]),
      right: new BN(list[1]),
      data: ab2h(list[2]),
      lockQuorum: new BN(list[3]),
      needQuorum: new BN(list[4]),
      keyQuorum: new BN(list[5]),
      locks: list[6].map((utag) => UTag.fromPreRLP(utag).toJSON()),
      needs: list[7].map((utag) => UTag.fromPreRLP(utag).toJSON()),
      pubkeys: list[8].map(ab2h)
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
      confirmHeader: ab2h(this.confirmHeader),
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
      this.confirmHeader,
      this.signatures.map((s) => Buffer(s)),
      this.extraData
    ]
  }

  static fromJSON (obj) {
    debug('Action.fromJSON %O', obj)
    const action = new Action()
    action.validSince = (new BN(obj.validSince)).toBuffer()
    action.validUntil = (new BN(obj.validUntil)).toBuffer()
    action.inputs = obj.inputs.map((i) => Input.fromJSON(i))
    action.outputs = obj.outputs.map((o) => Output.fromJSON(o))
    action.confirmHeader = Buffer.from(obj.confirmHeader, 'hex')
    action.signatures = obj.signatures.map((s)=>Buffer.from(s, 'hex'))
    action.extraData = Buffer.from(obj.extraData, 'hex')
    return action
  }

  static fromPreRLP (list) {
    debug('Action.fromPreRLP %O', list)
    return this.fromJSON({
      validSince: new BN(list[0]),
      validUntil: new BN(list[1]),
      inputs: list[2].map((i) => Input.fromPreRLP(i).toJSON()),
      outputs: list[3].map((o) => Output.fromPreRLP(o).toJSON()),
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

  mixHash () {
    return ab2h(hash(Buffer.concat([
      Buffer(this.prev),
      this.prevTotalWork.toBuffer(),
      Buffer(this.actroot),
      Buffer(this.miner),
      this.time.toBuffer()
    ])))
  }

  toJSON () {
    return {
      prev: ab2h(this.prev),
      prevTotalWork: ab2h(this.prevTotalWork.toBuffer()),
      actroot: ab2h(this.actroot),
      miner: ab2h(this.miner),
      time: ab2h(this.time.toBuffer()),
      fuzz: ab2h(this.fuzz),
      work: ab2h(this.work)
    }
  }

  toPreRLP () {
    return [
      Buffer(this.prev),
      this.prevTotalWork.toBuffer(),
      Buffer(this.actroot),
      Buffer(this.miner),
      this.time.toBuffer(),
      Buffer(this.fuzz),
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
    header.fuzz = h2ab(obj.fuzz)
    header.work = h2ab(obj.work)
    return header
  }

  static fromPreRLP (list) {
    debug('Header.fromPreRLP %O', list)
    return this.fromJSON({
      prev: ab2h(list[0]),
      prevTotalWork: new BN(list[1]),
      actroot: ab2h(list[2]),
      miner: ab2h(list[3]),
      time: new BN(list[4]),
      fuzz: ab2h(list[5]),
      work: ab2h(list[6])
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

  toPreRLP () {
    return [
      this.header.toPreRLP(),
      this.actions.map((a) => a.toPreRLP())
    ]
  }

  static fromJSON (obj) {
    debug('Block.fromJSON %O', obj)
    const block = new Block()
    block.header = Header.fromJSON(obj.header)
    block.actions = obj.actions.map((a) => Action.fromJSON(a))
    return block
  }

  static fromPreRLP (list) {
    debug('Block.fromPreRLP %O', list)
    return this.fromJSON({
      header: Header.fromPreRLP(list[0]).toJSON(),
      actions: list[1].map((a) => Action.fromPreRLP(a).toJSON())
    })
  }
}

module.exports = { Input, Output, Action, Header, Block }
