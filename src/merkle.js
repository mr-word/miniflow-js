// since transactions are public anyway, we don't try to hide the other transaction ID
// the other transaction ID visible in your SPV proof is called your merkle buddy

const { hash } = require('../src/crypto.js')

const ZERO = new Buffer(32).fill(0)

// operates on arraybuffers, not hex
function merkelize (list) {
  if (list.length == 0) return ZERO
  list = list.map((i) => Buffer(i))
  if (typeof (list[0]) === 'string') {
    throw new Error('merkelize operates directly on Buffers, not hex strings')
  }
  let current = list
  let next = []
  while (true) {
    for (var i = 0; i < current.length; i += 2) {
      var left = current[i]
      var right = i < current.length - 1 ? current[i + 1] : ZERO
      const pairhash = hash(new Buffer([...left, ...right]))
      next.push(pairhash)
    }
    if (next.length == 1) {
      return next[0]
    } else {
      current = next
      next = []
    }
  }
}

module.exports = { merkelize }
