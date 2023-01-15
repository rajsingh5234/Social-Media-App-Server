const router = require('express').Router();
const { signupController, loginController, refreshAccessTokenController, logoutController } = require('../controllers/authController');

router.post('/signup', signupController);
router.post('/login', loginController);
router.get('/refresh', refreshAccessTokenController);
router.post('/logout', logoutController);

module.exports = router;