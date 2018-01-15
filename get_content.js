const Prismic = require('prismic.io')
const colors = require('colors')
const Spinner = require('cli-spinner').Spinner

module.exports = () => {
  return new Promise((resolve, reject) => {
    // PROGRESS UPDATE
    const spinner = new Spinner('%s Getting content from prismic'.yellow)
    spinner.start()
    // PROGRESS UPDATE
    Prismic.api('https://nnnfreeport.prismic.io/api')
      .then(api => {
        return api.query('', {pageSize: 1000})
      })
      .then(
        response => {
          // PROGRESS UPDATE
          spinner.stop()
          console.log(
            '\n✓ Received content:'.green,
            String(response.results.length).green.underline
          )
          // PROGRESS UPDATE
          resolve(response.results)
        },
        err => {
          reject()
        }
      )
  })
}
