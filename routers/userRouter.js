const router = require('express').Router();
const {
    followOrUnfollowUserController,
    getPostOfFollowing,
    getMyPosts,
    getUserPosts,
    deleteMyProfile,
    getMyInfo,
    updateUserProfile,
    getUserProfile
} = require('../controllers/userController');
const requireUser = require('../middlewares/requireUser');

router.post('/follow', requireUser, followOrUnfollowUserController);
router.get('/getFeedData', requireUser, getPostOfFollowing);
router.get('/getMyPosts', requireUser, getMyPosts);
router.post('/getUserPosts', requireUser, getUserPosts);
router.delete('/', requireUser, deleteMyProfile);
router.get('/getMyInfo', requireUser, getMyInfo);
router.put('/', requireUser, updateUserProfile);
router.post('/getUserProfile', requireUser, getUserProfile);

module.exports = router;