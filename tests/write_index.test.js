const writeIndex = require('../write_index')

test('Return valid HTTP code', () => {
  expect.assertions(1)
  return writeIndex().then(data => {
    expect(data).toBe('200')
  })
})
