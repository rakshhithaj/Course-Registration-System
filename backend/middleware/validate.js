const { validationResult } = require('express-validator');

/**
 * Middleware that checks express-validator results and returns 400 on failure.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = validate;
