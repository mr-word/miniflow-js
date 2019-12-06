const immutable = require('immutable')
const L = immutable.List
const debug = require('debug')('miniflow:state')
const ab2h = require('array-buffer-to-hex')
const h2ab = require('hex-to-array-buffer')

const ZERO = ab2h(new ArrayBuffer(32))

class BlockTree {
  constructor () {
    this.multistate = immutable.Map()
    this.refs = new Map()

    this.multistate = this.multistate.set(L(['header', ZERO]), ZERO)
    this.refs.set(ZERO, this.multistate)
    this.stage = undefined
    this.locked = false
  }

  // future: lockless transparent reference giving `addHeader`, etc
  checkout (header) {
    if (!this.refs.has(header)) {
      throw new Error(`trying to checkout a header that doesn't exist: ${header}`)
    }
    this.locked = true
    this.stage = this.refs.get(header)
    return this
  }

  close () {
    this.stage = undefined
    this.locked = false
  }

  commit (header) {
    if (!this.locked) throw new Error('you must checkout a state to be able to commit')
    if (this.refs.has(header)) throw new Error('state already commit for this header')
    debug('committing stage to latest hash %O: %O', header, this.stage)
    this.refs.set(header, this.stage)
    this.multistate = this.stage
    this.stage = undefined
    this.locked = false
  }

  isUnspent (txid, idx, atBlock) {
    if (!this.locked) throw new Error('you must checkout a state to read isUnspent')
    let S
    if (atBlock === undefined) {
      S = this.stage
    } else {
      if (!this.refs.has(atBlock)) {
        throw new Error('requested isUnspent atBlock %O, but it is not in refs')
      }
      S = this.refs.get(atBlock)
    }
    return S.has(L(['utxo', txid, idx]))
  }

  hasHeader(header, inBranch) {
    if (!this.locked) throw new Error('you must checkout a state to read hasHeader')
    let S
    if (inBranch === undefined) {
      S = this.stage
    } else {
      if (!this.refs.has(inBranch)) {
        throw new Error('requested hasHeader given inBranch %O, but it is not in refs', header, inBranch)
      }
      S = this.refs.get(inBranch)
    }
    return S.has(L(['header', header]))
  }

  addHeader (header) {
    debug('adding header %O', header)
    if (!this.locked) throw new Error('you must checkout a state to call addHeader')
    const prev = header.prev
    const prevEntry = this.stage.get(L(['header', ab2h(prev)]))
    if (!prevEntry) throw new Error('prev header does not exist in blocktree')
    this.stage = this.stage.set(L(['header', header.hashID()]), header)
  }

  addUTXO (txid, idx) {
    debug('adding utxo %O', [txid, idx])
    if (!this.locked) throw new Error('you must checkout a state to call addUTXO')
    this.stage = this.stage.set(L(['utxo', txid, idx]), true)
  }

  delUTXO (txid, idx) {
    debug('deleting utxo %O', [txid, idx])
    if (!this.locked) throw new Error('you must checkout a state to call delUTXO')
    this.stage = this.stage.delete(L(['utxo', txid, idx]))
  }

  addBlock (block) {
    debug('adding block %O', block)
    if (!this.locked) throw new Error('you must checkout a state to call addBlock')
    this.stage = this.stage.set(['block', block.header.hashID()], block)
  }

  addAction (action) {
    debug('adding action %O', action)
    if (!this.locked) throw new Error('you must checkout a state to call addAction')
    this.stage = this.stage.set(['action', action.hashID], action)
  }

  insertBlock (block) {
    debug('insertBlock into blocktree: %O', block)
    if(this.locked) throw new Error(`cannot insertBlock into a locked blocktree`)

    const prevHeader = ab2h(block.header.prev)
    if (!this.refs.has(prevHeader)) {
      throw new Error(`trying to applyBlock but no known state for prevHeader ${prevHeader}`)
    }
    this.checkout(prevHeader)
    
    this.addHeader(block.header)
    this.addBlock(block)
    block.actions.forEach((action) => {
      this.addAction(action)
      action.outputs.forEach((output, idx) => {
        debug('adding utxo idx %s output %O action %O', idx, output, action)
        this.addUTXO(action.hashID(), idx)
      })
      action.inputs.forEach((input) => {
        debug('deleting utxo given in input %O from action %O', input, action)
        let ACTION = ab2h(input.action)
        if (ACTION != '') {
          this.delUTXO(ACTION, input.index.toNumber()) // TODO value types
        } else {
          this.delUTXO(action.hashID(), input.index.toNumber())
        }
      })
    })
    
    this.commit(block.header.hashID())
  }
}

module.exports = { BlockTree }
