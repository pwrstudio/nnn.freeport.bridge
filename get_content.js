const Prismic = require('prismic.io')

module.exports = () => {
  return new Promise((resolve, reject) => {
    console.log('– Getting content from prismic')

    var data = []

    // Recursive function to get all pages of posts
    fetchPosts = pg => {
      Prismic.api('https://nnnfreeport.prismic.io/api/v2')
        .then(api => {
          return api.query('', { page: pg, pageSize: 100 })
        })
        .then(
          response => {
            if (response.page < response.total_pages) {
              data = data.concat(response.results)
              fetchPosts(++pg)
            } else {
              data = data.concat(response.results)
              console.log('✓ Received content:', data.length)
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
