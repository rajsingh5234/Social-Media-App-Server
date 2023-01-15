const router = require('express').Router();
const { createPostController, likeAndUnlikePost, updatePostController, deletePost } = require('../controllers/postController');
const requireUser = require('../middlewares/requireUser');

router.post('/', requireUser, createPostController);
router.post('/like', requireUser, likeAndUnlikePost);
router.put('/', requireUser, updatePostController);
router.delete('/', requireUser, deletePost);

module.exports = router;