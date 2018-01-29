const Prismic = require('prismic.io')
const colors = require('colors')

module.exports = () => {
  return new Promise((resolve, reject) => {
    console.log('– Getting content from prismic'.yellow)

    var data = []

    // Recursive function to get all pages of posts
    fetchPosts = pg => {
      Prismic.api('https://nnnfreeport.prismic.io/api/v2')
        .then(api => {
          return api.query('', {page: pg, pageSize: 100})
        })
        .then(
          response => {
            console.log('response.page', response.page)
            console.log('response.total_pages', response.total_pages)
            if (response.page < response.total_pages) {
              data = data.concat(response.results)
              fetchPosts(++pg)
            } else {
              data = data.concat(response.results)
              console.log('✓ Received content:'.green, String(data.length).green.underline)
              resolve(data)
            }
          },
          err => {
            reject(err)
          }
        )
    }

    fetchPosts(1)
  })
}
