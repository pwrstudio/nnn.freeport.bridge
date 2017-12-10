const Prismic = require('prismic.io')

module.exports = () => {
  return new Promise((resolve, reject) => {
    Prismic.api('https://nnnfreeport.prismic.io/api')
      .then(api => {
        return api.query('')
      })
      .then(
        response => {
          resolve(response.results)
        },
        err => {
          reject()
        }
      )
  })
}
