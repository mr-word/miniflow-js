function testKeyPair () {
  return {
    publicKey: new Uint8Array([
      133, 42, 167, 181, 188, 206, 183, 20,
      47, 140, 199, 224, 187, 144, 5, 196,
      225, 135, 64, 54, 56, 200, 27, 31,
      86, 0, 60, 94, 54, 245, 231, 34
    ]),
    secretKey: new Uint8Array([
      101, 170, 252, 219, 167, 59, 91, 103, 254, 59, 228,
      150, 232, 49, 25, 50, 216, 10, 157, 34, 169, 77,
      96, 25, 144, 60, 113, 142, 6, 140, 238, 234, 133,
      42, 167, 181, 188, 206, 183, 20, 47, 140, 199, 224,
      187, 144, 5, 196, 225, 135, 64, 54, 56, 200, 27,
      31, 86, 0, 60, 94, 54, 245, 231, 34
    ])
  }
}

module.exports = {
  testKeyPair
}