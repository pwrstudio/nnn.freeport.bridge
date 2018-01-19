const Prismic = require('prismic.io')
const colors = require('colors')

module.exports = () => {
  return new Promise((resolve, reject) => {
    console.log('– Getting content from prismic'.yellow)

    Prismic.api('https://nnnfreeport.prismic.io/api')
      .then(api => {
        return api.query('', {pageSize: 1000})
      })
      .then(
        response => {
          console.log('✓ Received content:'.green, String(response.results.length).green.underline)

          resolve(response.results)
        },
        err => {
          reject(err)
        }
      )
  })
}
