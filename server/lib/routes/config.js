
exports.getConfig = (req,res,next) => {
  const config = {};
  generateReviewConfig(config);
  generateHelpTextConfig(config);
  res.send(config);
}

const generateReviewConfig = (config) => {
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

}

const generateHelpTextConfig = (config) => {
  config.helpText = process.env.HELP_HTML || false;
}
