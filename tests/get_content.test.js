const getContent = require('../get_content.js')

test('Return array', () => {
  expect.assertions(1)
  return getContent().then(data => {
    expect(data).toBeInstanceOf(Array)
  })
})
