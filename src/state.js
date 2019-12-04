const immutable = require('immutable')
const debug = require('debug')('miniflow:state')
const ab2h = require('array-buffer-to-hex')
const h2ab = require('hex-to-array-buffer')

const ZERO = new ArrayBuffer(32);

class State {
  constructor(head, headers, UTXO) {
    this.head = head
    this.headers = headers
    this.UTXO = UTXO
  }
  // (txid,idx)
  addUTXO(outTag) {
    this.UTXO = this.UTXO.add(outTag)
  }
  delUTXO(outTag) {
    this.UTXO = this.UTXO.delete(outTag)
  }
  pushHeader(header) {
    this.headers = this.headers.add(header)
    this.head = header
  }
}

class MultiState {
  constructor (validator) {
    this.validator = validator
    this.allBlocks = new Map()
    this.allActions = new Map()

    // header -> State
    this.snapshots = immutable.Map()
    let state0 = new State(ZERO, immutable.Set(), immutable.Set())
    this.snapshots = this.snapshots.set(ab2h(ZERO), state0)
    this.latest
  }

  isUnspent(header, outTag) {
    let s = this.snapshots.get(ab2h(header))
    if (!s) throw new Error(`no such header in multistate: ${ab2h(header)})`)
    return s.UTXO.has(outTag)
  }

  checkout(header) {
    debug(`checking out header`, header)
    debug(`  checkout out from snapshot map %O`, this.snapshots)
    return this.snapshots.get(ab2h(header))
  }

  commit(header, state) {
    this.snapshots = this.snapshots.set(ab2h(header), state)
  }

  insert (block) {
    debug(`state snapshots: %O`, this.snapshots)
    debug(`inserting block into multistate: %O`, block)

    this.allBlocks.set(ab2h(block.header.hashID()), block)
    block.actions.forEach((action) => {
        this.allActions.set(ab2h(action.hashID()), action)
    })

    let state = this.checkout(h2ab(block.header.prev))
    if (!state) throw new Error(`No such block.prev exists in the multistate`)
    let stateAfter = this.validator.evaluate(state, block)
    this.snapshots.set(ab2h(block.header.hashID()), stateAfter)
    // determine latest
    return this.latest = stateAfter
  }

  init (bang) {
    debug('init')
    const HEADER = ab2h(bang.header.hashID())
    debug(`bang HEADER is %s`, HEADER)
    this.allBlocks.set(HEADER, bang)
    this.allActions.set(ab2h(bang.actions[0].hashID()), bang.actions[0])

    let state = this.checkout(ZERO)

    debug(`checked out state in init %s`, state)
    state.pushHeader(HEADER)
    state.addUTXO(ab2h(bang.actions[0].getOutputTag(0)))
    state.addUTXO(ab2h(bang.actions[0].getOutputTag(1)))

    this.snapshots = this.snapshots.set(HEADER, state)
    this.latest = HEADER
  }
}

module.exports = { State, MultiState }
