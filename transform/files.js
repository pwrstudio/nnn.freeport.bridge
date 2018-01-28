const PrismicDOM = require('prismic-dom')
const colors = require('colors')
const {extract} = require('oembed-parser')
const ipfs = require('../shared/ipfs.js')
const helpers = require('../shared/helpers.js')

module.exports = data => {
  return new Promise((resolve, reject) => {
    console.log('Transforming files...'.yellow)

    data.transformed.files = []

    let contentPromiseArray = []
    data.filter(post => post.type === 'content').map(contentPost => {
      let tempContent = {}
      if (contentPost.rawJSON.title) {
        tempContent.title = PrismicDOM.RichText.asText(contentPost.rawJSON.title)
      }
      if (contentPost.rawJSON.content_type) {
        tempContent.media = contentPost.rawJSON.content_type
      }

      if (contentPost.rawJSON.hierarchy) {
        tempContent.hierarchy = contentPost.rawJSON.hierarchy
      } else {
        tempContent.hierarchy = 'Documentation'
      }

      if (contentPost.id) {
        tempContent.id = contentPost.id
      }

      // TEXT
      // TEXT
      // TEXT
      if (tempContent.media === 'Text') {
        console.log('/ Text:'.cyan, tempContent.title)

        let textContent = ''

        if (contentPost.rawJSON.text) {
          textContent = PrismicDOM.RichText.asHtml(contentPost.rawJSON.text, helpers.linkResolver)
        }
        let textPromise = ipfs.addText(textContent)
        contentPromiseArray.push(textPromise)
        textPromise.then(ipfs => {
          tempContent.ipfs = ipfs
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.hierarchy = tempContent.hierarchy
          baseContent.id = tempContent.id
          data.transformed.files.push(baseContent)
        })
        textPromise.catch(err => {
          console.log('TEXT: Caught error:'.red, String(err).red)
        })
        // IMAGE
        // IMAGE
        // IMAGE
        // IMAGE
      } else if (tempContent.media === 'Image') {
        console.log('/ Image:'.cyan, tempContent.title)

        let imageURL = ''
        if (contentPost.rawJSON.image) {
          imageURL = contentPost.rawJSON.image.url
        }
        let imagePromise = ipfs.addFile(imageURL)
        contentPromiseArray.push(imagePromise)
        imagePromise.then(ipfs => {
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.size = ipfs[0].size
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.hierarchy = tempContent.hierarchy
          baseContent.id = tempContent.id
          if (contentPost.rawJSON.caption) {
            baseContent.caption = PrismicDOM.RichText.asHtml(
              contentPost.rawJSON.caption,
              helpers.LinkResolver
            )
          }
          data.transformed.files.push(baseContent)
        })
        imagePromise.catch(err => {
          console.log('IMAGE: Caught error:'.red, String(err).red)
        })
        // AUDIO
        // AUDIO
        // AUDIO
      } else if (tempContent.media === 'Audio') {
        console.log('/ Audio:'.cyan, tempContent.title)

        let audioURL = ''
        // Add audio file
        if (contentPost.rawJSON.audio && contentPost.rawJSON.audio.url) {
          audioURL = contentPost.rawJSON.audio.url
        }
        let audioPromise = ipfs.addFile(audioURL)
        contentPromiseArray.push(audioPromise)

        // Add audio poster image
        if (contentPost.rawJSON.audio_poster_image && contentPost.rawJSON.audio_poster_image.url) {
          let posterURL = contentPost.rawJSON.audio_poster_image.url
          var posterPromise = ipfs.addFile(posterURL)
          contentPromiseArray.push(posterPromise)
        }

        Promise.all([audioPromise, posterPromise]).then(ipfs => {
          let baseContent = {}
          if (ipfs[0] && ipfs[0][0]) {
            baseContent.hash = ipfs[0][0].hash
            baseContent.size = ipfs[0][0].size
          }
          // Write poster image hash
          if (ipfs[1] && ipfs[1][0]) {
            baseContent.poster = ipfs[1][0].hash
          }
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.hierarchy = tempContent.hierarchy
          baseContent.id = tempContent.id
          data.transformed.files.push(baseContent)
        })
        audioPromise.catch(err => {
          console.log('AUDIO: Caught error:'.red, String(err).red)
        })
        // VIDEO
        // VIDEO
        // VIDEO
      } else if (tempContent.media === 'Video') {
        console.log('/ Video:'.cyan, tempContent.title)

        let videoURL = ''
        if (contentPost.rawJSON.video && contentPost.rawJSON.video.url) {
          videoURL = contentPost.rawJSON.video.url
        }
        let videoPromise = ipfs.addFile(videoURL)
        contentPromiseArray.push(videoPromise)
        videoPromise.then(ipfs => {
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.size = ipfs[0].size
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.hierarchy = tempContent.hierarchy
          baseContent.id = tempContent.id
          data.transformed.files.push(baseContent)
        })
        videoPromise.catch(err => {
          console.log('VIDEO: Caught error:'.red, String(err).red)
        })
        // FILE
        // FILE
        // FILE
      } else if (tempContent.media === 'File') {
        console.log('/ File:'.cyan, tempContent.title)

        let fileURL = ''
        if (contentPost.rawJSON.file && contentPost.rawJSON.file.url) {
          fileURL = contentPost.rawJSON.file.url
        }
        let filePromise = ipfs.addFile(fileURL)
        contentPromiseArray.push(filePromise)

        // Add file poster image
        if (contentPost.rawJSON.video_poster_image && contentPost.rawJSON.video_poster_image.url) {
          let posterURL = contentPost.rawJSON.video_poster_image.url
          var posterPromise = ipfs.addFile(posterURL)
          contentPromiseArray.push(posterPromise)
        }

        Promise.all([filePromise, posterPromise]).then(ipfs => {
          let baseContent = {}
          if (ipfs[0] && ipfs[0][0]) {
            baseContent.hash = ipfs[0][0].hash
            baseContent.size = ipfs[0][0].size
          }
          // Write poster image hash
          if (ipfs[1] && ipfs[1][0]) {
            baseContent.poster = ipfs[1][0].hash
          }
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.hierarchy = tempContent.hierarchy
          baseContent.id = tempContent.id
          data.transformed.files.push(baseContent)
        })
        filePromise.catch(err => {
          console.log('FILE: Caught error:'.red, String(err).red)
        })
        // LINK
        // LINK
        // LINK
      } else if (tempContent.media === 'External link') {
        console.log('/ Link:'.cyan, tempContent.title)

        // Add link
        let linkURL = ''
        if (contentPost.rawJSON.external_link && contentPost.rawJSON.external_link.url) {
          linkURL = contentPost.rawJSON.external_link.url
        }

        // Get oembed info
        // if (linkURL.length > 0) {
        //   extract(linkURL).then(data => {
        //     var linkPromise = ipfs.addText({
        //       url: linkURL,
        //       oembed: data
        //     })
        //     contentPromiseArray.push(linkPromise)
        //   })
        // } else {
        //   var linkPromise = ipfs.addText({
        //     url: linkURL
        //   })
        //   contentPromiseArray.push(linkPromise)
        // }

        var linkPromise = ipfs.addText(linkURL)
        contentPromiseArray.push(linkPromise)

        // Add link poster image
        if (contentPost.rawJSON.link_poster_image && contentPost.rawJSON.link_poster_image.url) {
          let posterURL = contentPost.rawJSON.link_poster_image.url
          var posterPromise = ipfs.addFile(posterURL)
          contentPromiseArray.push(posterPromise)
        }

        Promise.all([linkPromise, posterPromise]).then(ipfs => {
          let baseContent = {}
          if (ipfs[0] && ipfs[0][0]) {
            baseContent.hash = ipfs[0][0].hash
            baseContent.size = ipfs[0][0].size
          }
          // Write poster image hash
          if (ipfs[1] && ipfs[1][0]) {
            baseContent.poster = ipfs[1][0].hash
          }
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.hierarchy = tempContent.hierarchy
          baseContent.id = tempContent.id
          data.transformed.files.push(baseContent)
        })
        linkPromise.catch(err => {
          console.log('LINK: Caught error:'.red, String(err).red)
        })
      }
    })
    Promise.all(contentPromiseArray)
      .then(() => {
        console.log('\n✓ All files processed'.green)
        resolve(data.sort(helpers.idSort))
      })
      .catch(err => {
        console.log('file promise rejection'.red, err)
        reject(err)
      })
  })
}
