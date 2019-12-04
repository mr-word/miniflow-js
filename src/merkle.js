// since transactions are public anyway, we don't try to hide the other transaction ID
// the other transaction ID visible in your SPV proof is called your merkle buddy

const { hash } = require('../src/crypto.js')

const ZERO = new Buffer(32).fill(0)

function merkelize (list) {
  if (list.length == 0) return hash(ZERO)
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
