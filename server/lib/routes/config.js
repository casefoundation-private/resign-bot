const Configuration = require('../models/configuration')

exports.getConfig = (req, res, next) => {
  Configuration.allMapped()
    .then(configs => res.send(configs))
    .catch(err => next(err))
}

exports.saveConfig = (req, res, next) => {
  if (req.user.isAdmin()) {
    Configuration
      .saveMapped(req.body)
      .then(() => Configuration.allMapped())
      .then(configs => res.send(configs))
      .catch(err => next(err))
  } else {
    res.send(403)
  }
}

// const loadConfig = () => {
//   config = {}
//   return Promise.all([
//     // generateGeneralConfig(config),
//     // generateReviewConfig(config),
//     // generateHelpTextConfig(config),
//     generateSubmissionsConfig(config)
//   ])
// }

// const generateGeneralConfig = (config) => {
//   return new Promise((resolve, reject) => {
//     config.perPage = parseInt(process.env.PER_PAGE || 0)
//     resolve()
//   })
// }

// const generateReviewConfig = (config) => {
//   return new Promise((resolve, reject) => {
//     config.review = {
//       'prompts': [],
//       'categories': []
//     }
//     for (var i = 0; i < (parseInt(process.env.REVIEW_PROMPTS_COUNT) || 0); i++) {
//       const prop = 'REVIEW_PROMPT_' + i
//       config.review.prompts[i] = {
//         'prompt': process.env[prop],
//         'labels': []
//       }
//       for (var j = 0; j < (parseInt(process.env['REVIEW_PROMPT_' + i + '_LABELS_COUNT']) || parseInt(process.env.REVIEW_PROMPT_LABELS_COUNT) || 0); j++) {
//         config.review.prompts[i].labels[j] = process.env['REVIEW_PROMPT_' + i + '_LABEL_' + j] || process.env['REVIEW_PROMPT_LABEL_' + j]
//       }
//     }
//     for (i = 0; i < (parseInt(process.env.REVIEW_CATEGORIES_COUNT) || 0); i++) {
//       const prop = 'REVIEW_CATEGORY_' + i
//       config.review.categories[i] = {
//         'prompt': process.env[prop],
//         'labels': []
//       }
//       for (j = 0; j < (parseInt(process.env['REVIEW_CATEGORY_' + i + '_LABELS_COUNT']) || parseInt(process.env.REVIEW_CATEGORY_LABELS_COUNT) || 0); j++) {
//         config.review.categories[i].labels[j] = process.env['REVIEW_CATEGORY_' + i + '_LABEL_' + j] || process.env['REVIEW_CATEGORY_LABEL_' + j]
//       }
//     }
//     resolve()
//   })
// }

// const generateHelpTextConfig = (config) => {
//   if (process.env.HELP_HTML) {
//     return new Promise((resolve, reject) => {
//       config.helpText = process.env.HELP_HTML
//       resolve()
//     })
//   } else if (process.env.HELP_GOOGLE_DOC_ID) {
//     setInterval(() => fetchGoogleDocsContent(config).catch((err) => console.error(err)), (1000 * 60 * 60))
//     return fetchGoogleDocsContent(config)
//   }
// }

// const fetchGoogleDocsContent = (config) => {
//   return new Promise((resolve, reject) => {
//     drive.files.export({
//       'fileId': process.env.HELP_GOOGLE_DOC_ID,
//       'auth': process.env.GOOGLE_API_KEY,
//       'mimeType': 'text/html'
//     }, (err, data) => {
//       if (err) {
//         reject(err)
//       } else {
//         config.helpText = sanitizeHtml(data, {
//           allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
//             'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
//             'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre' ]
//         })
//         resolve()
//       }
//     })
//   })
// }

// const generateSubmissionsConfig = (config) => {
//   return new Promise((resolve, reject) => {
//     config.submissions = {
//       'pinned_limit': process.env.PINNED_LIMIT ? parseInt(process.env.PINNED_LIMIT) : null,
//       'review_limit': process.env.REVIEW_LIMIT ? parseInt(process.env.REVIEW_LIMIT) : null
//     }
//     resolve()
//   })
// }
