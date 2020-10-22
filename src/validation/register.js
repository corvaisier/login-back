const { body } = require('express-validator');

module.exports = [
    body('email').exists().trim().isEmail().normalizeEmail(),
    body('password').exists().not().isEmpty()
];