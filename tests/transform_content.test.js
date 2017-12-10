const transformContent = require('../transform_content')

test('Exists', () => {
  // expect.assertions(1)
  return transformContent().then(data => {
    expect(data).toBeInstanceOf(Array)
  })
})
