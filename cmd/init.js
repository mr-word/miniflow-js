const debug = require('debug')('miniflow:cmd/init')
const bang = require('../src/bang.js')
const fs = require('fs')

const path = `db/blocks/${bang.header.hashID()}.json`
const json = JSON.stringify(bang.toJSON(), null, 2)
debug(path)
debug(json)
fs.writeFileSync(path, json)
