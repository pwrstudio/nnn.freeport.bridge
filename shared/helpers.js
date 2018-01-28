module.exports = {
  idSort: (a, b) => {
    if (a.id < b.id) {
      return -1
    }
    if (a.id > b.id) {
      return 1
    }
    return 0
  },
  linkResolver: (doc, ctx) => {
    if (doc.type === 'test') return `/page/${doc.uid}`
    return '/'
  }
}
