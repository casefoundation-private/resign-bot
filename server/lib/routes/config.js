const google = require('googleapis');
const drive = google.drive('v3');

let config = null;

exports.getConfig = (req,res,next) => {
  if (!config) {
    loadConfig().then(() => {
      res.send(config);
    }).catch((err) => next(err));
  } else {
    res.send(config);
  }
}

const loadConfig = () => {
  config = {};
  return Promise.all([
    generateReviewConfig(config),
    generateHelpTextConfig(config),
  ])
}

const generateReviewConfig = (config) => {
  return new Promise((resolve,reject) => {
    config.review = {
      'prompts': []
    };
    for(var i = 0; i < (parseInt(process.env.REVIEW_PROMPTS_COUNT) || 0); i++) {
      const prop = 'REVIEW_PROMPT_' + i;
      config.review.prompts[i] = {
        'prompt': process.env[prop],
        'labels': []
      };
      for(var j = 0; j < (parseInt(process.env['REVIEW_PROMPT_' + i + '_LABELS_COUNT']) || parseInt(process.env.REVIEW_PROMPT_LABELS_COUNT) || 0); j++) {
        config.review.prompts[i].labels[j] = process.env['REVIEW_PROMPT_' + i + '_LABEL_' + j] || process.env['REVIEW_PROMPT_LABEL_' + j];
      }
    }
    resolve();
  });
}

const generateHelpTextConfig = (config) => {
  return new Promise((resolve,reject) => {
    if (process.env.HELP_HTML) {
      config.helpText = process.env.HELP_HTML;
      resolve();
    } else if (process.env.HELP_GOOGLE_DOC_ID) {
      drive.files.export({
        'fileId': process.env.HELP_GOOGLE_DOC_ID,
        'auth': process.env.GOOGLE_API_KEY,
        'mimeType': 'text/html'
      },(err,data) => {
        if (err) {
          reject(err);
        } else {
          config.helpText = data;
          console.log(data);
          resolve();
        }
      })
    }
  });
}

loadConfig().catch((err) => console.log(err));
