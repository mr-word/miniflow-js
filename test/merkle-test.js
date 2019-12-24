const { merkelize } = require('../src/merkle.js')
const { hash } = require('../src/crypto.js')
const ab2h = require('array-buffer-to-hex')
const want = require('chai').expect

const zero = new Buffer(32).fill(0)

describe('dense binary merkle tree', () => {
  it('3 items', () => {
    const item0 = new Buffer(32).fill(7)
    const item1 = new Buffer(32).fill(1)
    const item2 = new Buffer(32).fill(2)

    const l1i0 = hash(new Buffer([...item0, ...item1]))
    const l1i1 = hash(new Buffer([...item2, ...zero]))

    const l2i0 = hash(new Buffer([...l1i0, ...l1i1]))

    const merkle = merkelize([item0, item1, item2])

    want(merkle).deep.equal(l2i0)
  })

  it('5 items', () => {
    const item0 = new Buffer(32).fill(7)
    const item1 = new Buffer(32).fill(1)
    const item2 = new Buffer(32).fill(2)
    const item3 = new Buffer(32).fill(3)
    const item4 = new Buffer(32).fill(4)

    const l1i0 = hash(new Buffer([...item0, ...item1]))
    const l1i1 = hash(new Buffer([...item2, ...item3]))
    const l1i2 = hash(new Buffer([...item4, ...zero]))

    const l2i0 = hash(new Buffer([...l1i0, ...l1i1]))
    const l2i1 = hash(new Buffer([...l1i2, ...zero]))

    const l3i0 = hash(new Buffer([...l2i0, ...l2i1]))

    const merkle = merkelize([item0, item1, item2, item3, item4])
    want(merkle).deep.equal(l3i0)
  })
})
