const immutable = require('immutable')
const L = immutable.List
const debug = require('debug')('miniflow:state')
const ab2h = require('array-buffer-to-hex')
const h2ab = require('hex-to-array-buffer')
const BN = require('bn.js')

const ZERO = ab2h(new ArrayBuffer(32))

class State {
  constructor (multistate) {
    this.multistate = multistate
  }

  hasHeader (header) {
    return this.multistate.has(L(['header', header]))
  }

  getHeader (header) {
    return this.multistate.get(L(['header', header]))
  }

  addHeader (header) {
    debug('adding header %O', header)
    const prev = header.prev
    const prevEntry = this.multistate.get(L(['header', ab2h(prev)]))
    if (!prevEntry) throw new Error('prev header does not exist in blocktree')
    this.multistate = this.multistate.set(L(['header', header.hashID()]), header)
  }

  isUnspent (txid, idx) {
    if (typeof (txid) !== 'string') throw new Error('use hex string keys for txid')
    if (typeof (idx) !== 'string') throw new Error('use hex string keys for idx')
    return this.multistate.has(L(['utxo', txid, idx]))
  }

  addUTXO (txid, idx) {
    if (typeof (txid) !== 'string') throw new Error('use hex string keys for txid')
    if (typeof (idx) !== 'string') throw new Error('use hex string keys for idx')
    debug('adding utxo %O', [txid, idx])
    this.multistate = this.multistate.set(L(['utxo', txid, idx]), true)
  }

  delUTXO (txid, idx) {
    if (typeof (txid) !== 'string') throw new Error('use hex string keys for txid')
    if (typeof (idx) !== 'string') throw new Error('use hex string keys for idx')
    debug('deleting utxo %O', [txid, idx])
    this.multistate = this.multistate.delete(L(['utxo', txid, idx]))
  }

  addBlock (block) {
    debug('adding block %O', block)
    this.multistate = this.multistate.set(L(['block', block.header.hashID()]), block)
  }

  addAction (action) {
    debug('adding action %O', action)
    this.multistate = this.multistate.set(L(['action', action.hashID]), action)
  }

  insertBlock (block) {
    debug('insertBlock into blocktree: %O', block)

    const prevHeader = ab2h(block.header.prev)
    if (!this.hasHeader(prevHeader)) {
      throw new Error(`trying to applyBlock but no known state for prevHeader ${prevHeader}`)
    }

    this.addHeader(block.header)
    this.addBlock(block)
    block.actions.forEach((action) => {
      this.addAction(action)
      action.outputs.forEach((output, idx) => {
        debug('adding utxo idx %s output %O action %O', idx, output, action)
        this.addUTXO(action.hashID(), (new BN(idx)).toBuffer().toString('hex'))
      })
      action.inputs.forEach((input) => {
        debug('deleting utxo given in input %O from action %O', input, action)
        const ACTION = ab2h(input.action)
        if (ACTION != '') {
          this.delUTXO(ACTION, input.index.toString('hex'))
        } else {
          this.delUTXO(action.hashID(), input.index.toString('hex'))
        }
      })
    })
  }
}

class BlockTree {
  constructor (block0) {
    this.multistate = immutable.Map()
    this.refs = new Map()

    this.multistate = this.multistate.set(L(['header', '']), true) // can't set empty string, interprets as delete
    this.refs.set('', this.multistate)

    const s = this.checkout('')
    s.insertBlock(block0)
    this.commit(block0.header.hashID(), s)
  }

  // future: lockless transparent reference giving `addHeader`, etc
  checkout (header) {
    if (!this.refs.has(header)) {
      throw new Error(`trying to checkout a header that doesn't exist: ${header}`)
    }
    return new State(this.refs.get(header))
  }

  commit (header, state) {
    if (this.refs.has(header)) throw new Error('state already commit for this header')
    debug('committing stage to header %O: %O', header, state)
    this.refs.set(header, state.multistate)
  }
}

module.exports = { BlockTree }
