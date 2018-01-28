const PrismicDOM = require('prismic-dom')
const colors = require('colors')
const helpers = require('../shared/helpers.js')

module.exports = data => {
  return new Promise((resolve, reject) => {
    console.log('– Adding about...'.yellow)
    data.transformed = {
      about: {}
    }

    // console.log(JSON.stringify(data, null, 4))

    let about = data.find(post => post.type === 'about_page')

    // INFO
    data.transformed.about.info = PrismicDOM.RichText.asHtml(
      about.rawJSON.info_text,
      helpers.linkResolver
    )

    console.log(data.transformed.about.info)

    // TECH
    data.transformed.about.tech = PrismicDOM.RichText.asHtml(
      about.rawJSON.tech,
      helpers.linkResolver
    )

    console.log(data.transformed.about.tech)

    // CREDITS
    data.transformed.about.credits = PrismicDOM.RichText.asHtml(
      about.rawJSON.credits,
      helpers.linkResolver
    )
    console.log(data.transformed.about.credits)

    console.log('✓ About page added'.green)

    resolve(data)
  })
}
