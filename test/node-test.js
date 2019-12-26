const debug = require('debug')('miniflow:node-test')
const ab2h = require('array-buffer-to-hex')
const want = require('chai').expect
const BN = require('bn.js')

const { MiniNode } = require('../src/node.js')
const bang = require('../src/bang.js')

describe('manaflow node', () => {
  it('makes a block after block0', () => {
    const node = new MiniNode()
    const BANG = bang.header.hashID()
    const resultBlock = node.makeBlock(BANG, [], 123456789)
    want(ab2h(resultBlock.header.prev)).equal(bang.header.hashID())
    const givenWork = resultBlock.header.work
    resultBlock.rework()
    const rework = resultBlock.header.work
    want(ab2h(givenWork)).equal(ab2h(rework))
  })
})
