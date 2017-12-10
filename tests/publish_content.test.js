const publishContent = require('../publish_content')
const isIPFS = require('is-ipfs')

expect.extend({
  toBeMultihash(received) {
    if (isIPFS.multihash(received)) {
      return {
        message: () => `expected ${received} to be a valid Multihash`,
        pass: true
      }
    } else {
      return {
        message: () => `expected ${received} to be a valid Multihash`,
        pass: false
      }
    }
  }
})

test('Is valid IPFS hash', () => {
  // expect.assertions(1)
  return publishContent().then(data => {
    expect(data).toBeMultihash()
  })
})
