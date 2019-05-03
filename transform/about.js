const PrismicDOM = require('prismic-dom')
const helpers = require('../shared/helpers.js')
const logUpdate = require('log-update')

module.exports = data => {
  return new Promise((resolve, reject) => {
    logUpdate('– Adding about...')
    data.transformed = {
      about: {}
    }

    let about = data.find(post => post.type === 'about_page')

    // INFO
    data.transformed.about.info = PrismicDOM.RichText.asHtml(
      about.rawJSON.info_text,
      helpers.linkResolver
    )

    // TECH
    data.transformed.about.tech = PrismicDOM.RichText.asHtml(
      about.rawJSON.tech,
      helpers.linkResolver
    )

    // CREDITS
    data.transformed.about.credits = PrismicDOM.RichText.asHtml(
      about.rawJSON.credits,
      helpers.linkResolver
    )

    logUpdate('✓ About page added')
    logUpdate.done()

    resolve(data)
  })
}
