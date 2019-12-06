const immutable = require('immutable')
const { BlockTree } = require('../src/blocktree.js')
const { Validator, ValidationError } = require('../src/validator.js')
const want = require('chai').expect
const bang = require('../src/bang')
const { block1 } = require('../test/blocks.js')
const ZERO = '0'.repeat(64)

describe('validator', ()=>{
    beforeEach(()=>{
        time = 0
        v = new Validator(()=>time)
        b = new BlockTree()
        s = b.checkout(ZERO)
        s = v.evaluate(s, bang)
        b.commit(bang.header.hashID(), s)
    })
    it('test block1',()=>{
        s = b.checkout(bang.header.hashID())
        s = v.evaluate(s, block1)
    })
    it('test block1 nomerk',()=>{
        s = b.checkout(bang.header.hashID())
        block1.header.actroot = ZERO
        want(()=> v.evaluate(s, block1)).to.throw(ValidationError)
    })
})
