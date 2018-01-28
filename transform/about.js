const PrismicDOM = require('prismic-dom')
const toMarkdown = require('to-markdown')
const colors = require('colors')

module.exports = data => {
  return new Promise((resolve, reject) => {
    console.log('– Adding about...'.yellow)
    data.transformed = {
      about: {}
    }

    let about = data.find(post => post.type === 'about_page')

    // INFO
    data.transformed.about.info = toMarkdown(
      PrismicDOM.RichText.asHtml(about.data['about_page.info_text'].value)
    )

    // TECH
    data.transformed.about.tech = toMarkdown(
      PrismicDOM.RichText.asHtml(about.data['about_page.tech'].value)
    )

    // CREDITS
    data.transformed.about.credits = toMarkdown(
      PrismicDOM.RichText.asHtml(about.data['about_page.credits'].value)
    )

    console.log('✓ About page added'.green)

    resolve(data)
  })
}
