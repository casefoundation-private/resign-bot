
exports.getConfig = (req,res,next) => {
  const config = {};
  generateReviewConfig(config);
  res.send(config);
}

const generateReviewConfig = (config) => {
  config.review = {
    'prompts': [],
    'labels': []
  };
  for(var i = 0; i < (parseInt(process.env.REVIEW_PROMPTS_COUNT) || 0); i++) {
    const prop = 'REVIEW_PROMPT_' + i;
    config.review.prompts[i] = process.env[prop];
  }
  for(var i = 0; i < (parseInt(process.env.REVIEW_PROMPT_LABELS_COUNT) || 0); i++) {
    const prop = 'REVIEW_PROMPT_LABEL_' + i;
    config.review.labels[i] = process.env[prop];
  }
}
