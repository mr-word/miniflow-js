const immutable = require('immutable')
const debug = require('debug')('miniflow:state')
const ab2h = require('array-buffer-to-hex')
const h2ab = require('hex-to-array-buffer')

const ZERO = ab2h(new ArrayBuffer(32))

class BlockTree {
  constructor (validator) {
    // [HEADER, 'pastheader', HEADER] -> bool
    // [HEADER, 'utxo', ACTION, idx] -> CONFHEADER
    // [HEADER, 'block'] -> block
    // [HEADER, 'action', ACTION] -> CONFHEADER
    //   ^^ in *this* history, which header confirmed this action
    // [HEADER, 'trie'] -> trie
    this.multistate = immutable.Map()
    // endpoint -> endpoint
    this.trie = immutable.Map()
    this.multistate.set('trie', this.trie)

    // header -> multistate ref
    this.snapshots = new Map()

    this.validator = validator

    this.addHeader(ZERO, ZERO)
    this.commit(ZERO)
  }

  isUnspent (header, actID, idx) {
    debug('querying isSpent over snapshots %O', this.snapshots)
    debug('with header,actID,idx = ', header, actID, idx)
    const s = this.snapshots.get(header)
    if (!s) throw new Error(`no such header in blocktree: ${header}`)
    return this.multistate.has(['utxo', actID, idx])
  }

  commit (header) {
    if (this.snapshots[header]) throw new Error('snapshot already exists for this header')
    this.snapshots[header] = this.multistate
  }

  insert (block) {
    debug('state snapshots: %O', this.snapshots)
    debug('inserting block into blocktree: %O', block)

    this.allBlocks.set(block.header.hashID(), block)
    block.actions.forEach((action) => {
      this.allActions.set(action.hashID(), action)
    })

    const state = this.checkout(h2ab(block.header.prev))
    if (!state) throw new Error('No such block.prev exists in the blocktree')
    const stateAfter = this.validator.evaluate(state, block)
    this.snapshots.set(block.header.hashID(), stateAfter)
    // determine latest
    // return this.latest = stateAfter
    return stateAfter
  }

  addHeader (header, after) {
    this.multistate = this.multistate.set([header, 'pastheader', after], true)
  }

  addUTXO (header, txid, idx) {
    this.multistate = this.multistate.set([header, txid, idx], true)
  }

  addBlock (header, block) {
    this.multistate = this.multistate.set([header, 'block'], block)
  }

  addAction (header, action) {
    this.multistate = this.multistate.set([header, 'action', action.hashID], action)
  }

  addUTXO (header, action) {
    this.multistate = this.multistate.set([header, 'action', action.hashID], action)
  }
}

module.exports = { BlockTree }
