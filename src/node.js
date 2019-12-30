const debug = require('debug')('miniflow:node')

const BN = require('bn.js')
const bang = require('./bang.js')
const miner = require('./miner.js')
const { Block, Header } = require('./data.js')
const { Validator } = require('./validator.js')
const { BlockTree } = require('./blocktree.js')

class MiniNode {
  constructor () {
    this.validator = new Validator()
    this.blocktree = new BlockTree(bang)
    this.bestValidBlock = bang.header.hashID()
  }

  init (datadir) {
  }

  load (datadir) {
    // load any remaining block
    // recursively load `prev` blocks, counting cumulative work
  }

  loadBranch() {
    //
  }

  makeBlock (afterHeader, actions, time) {
    const state = this.blocktree.checkout(afterHeader)
    const prevHeader = state.getHeader(afterHeader)
    debug(prevHeader)
    let timestr = time.toString('16')
    if (timestr.length % 2 == 1) {
      timestr = '0' + timestr
    }
    debug('time', time, timestr)
    const block = Block.fromJSON({
      header: {
        prev: prevHeader.hashID(),
        root: '', // .remerk()
        xtrs: '',
        node: '',
        time: timestr,
        fuzz: '' // .mine()
      },
      actions: actions
    })
    block.remerk()

    const tuff = new BN(Buffer.from(prevHeader.hashID(), 'hex')) // TODO dpow
    const mix = block.header.mixHash()
    const fuzz = miner.work(mix, tuff, time)
    debug('mix', mix)
    debug('fuzz', fuzz)
    block.header.fuzz = fuzz
    debug(block)
    return block
  }
}

module.exports = { MiniNode }
