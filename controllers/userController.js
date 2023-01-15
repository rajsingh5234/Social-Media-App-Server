const Post = require("../models/Post");
const User = require("../models/User");
const { error, success } = require("../utils/responseWrapper");
const cloudinary = require('cloudinary').v2;
const { mapPostOutput } = require('../utils/Utils')

const followOrUnfollowUserController = async (req, res) => {
    try {

        const { userIdToFollow } = req.body;

        const curUserId = req._id;

        const userToFollow = await User.findById(userIdToFollow);
        const currUser = await User.findById(curUserId);

        if (curUserId === userIdToFollow) {
            return res.send(error(409, 'users cannot follow themselves'));
        }

        if (!userToFollow) {
            return res.send(error(404, 'user to follow not found'));
        }

        if (currUser.followings.includes(userIdToFollow)) {
            const followingIndex = currUser.followings.indexOf(userIdToFollow);
            currUser.followings.splice(followingIndex, 1);

            const followerIndex = userToFollow.followers.indexOf(curUserId);
            userToFollow.followers.splice(followerIndex, 1);
        }
        else {
            userToFollow.followers.push(curUserId);
            currUser.followings.push(userIdToFollow);
        }

        await userToFollow.save();
        await currUser.save();

        return res.send(success(200, { user: userIdToFollow }));

    } catch (e) {
        console.log(e);
        return res, send(error(500, e.message));
    }
}

const getPostOfFollowing = async (req, res) => {
    try {

        const curUserId = req._id;

        const currUser = await User.findById(curUserId).populate('followings');

        const fullPosts = await Post.find({
            owner: {
                $in: currUser.followings
            }
        }).populate('owner')

        const posts = fullPosts.map(item => mapPostOutput(item, req._id)).reverse();

        const followingsIds = currUser.followings.map(item => item._id);
        followingsIds.push(req._id);

        const suggestions = await User.find({
            _id: {
                $nin: followingsIds
            }
        })

        return res.send(success(200, { ...currUser._doc, suggestions, posts }));

    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message));
    }

}

const getMyPosts = async (req, res) => {
    try {

        const currUserId = req._id;

        const allUserPosts = await Post.find({
            owner: currUserId
        }).populate('likes')

        return res.send(success(200, { allUserPosts }));

    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message));
    }
}

const getUserPosts = async (req, res) => {
    try {

        const { userId } = req.body;

        if (!userId) {
            return res.send(error(400, 'userId is required'));
        }

        const allUserPosts = await Post.find({
            owner: userId
        }).populate('likes')

        return res.send(success(200, { allUserPosts }));

    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message));
    }
}

const deleteMyProfile = async (req, res) => {
    try {

        const currUserId = req._id;
        const currUser = await User.findById(currUserId);

        // delete all posts
        await Post.deleteMany({
            owner: currUserId
        })

        // removed myself from every followers followings
        currUser.followers.forEach(async (followerId) => {
            const follower = await User.findById(followerId);
            const index = follower.followings.indexOf(currUserId);

            follower.followings.splice(index, 1);
            await follower.save();
        })

        // removed myself from my followings followers
        currUser.followings.forEach(async (followingId) => {
            const following = await User.findById(followingId);
            const index = following.followers.indexOf(currUserId);

            following.followers.splice(index, 1);
            await following.save();
        })

        // remove myself from all likes
        const allPosts = await Post.find();
        allPosts.forEach(async (post) => {
            const index = post.likes.indexOf(currUserId);
            post.likes.splice(index, 1);
            await post.save();
        })

        // delete user
        await currUser.remove();

        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true
        })

        return res.send(success(200, 'user deleted'));

    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message));
    }
}

const getMyInfo = async (req, res) => {
    try {

        const user = await User.findById(req._id);

        return res.send(success(200, { user }));

    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message));
    }
}

const updateUserProfile = async (req, res) => {
    try {

        const { name, bio, userImg } = req.body;

        const user = await User.findById(req._id);

        if (name) {
            user.name = name;
        }

        if (bio) {
            user.bio = bio;
        }
        if (userImg) {
            const cloudImg = await cloudinary.uploader.upload(userImg, {
                folder: 'profileImg'
            })

            user.avatar = {
                url: cloudImg.secure_url,
                publicId: cloudImg.public_id
            }
        }

        await user.save();
        return res.send(success(200, { user }));

    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message));
    }
}

const getUserProfile = async (req, res) => {
    try {

        const userId = req.body.userId;

        const user = await User.findById(userId).populate({
            path: 'posts',
            populate: {
                path: 'owner'
            }
        })

        console.log('user profile --->', user);

        const fullPosts = user.posts;

        // reverse the array so that latest post comes at the top
        const posts = fullPosts.map(item => mapPostOutput(item, req._id)).reverse();

        // user._doc, removes the extra fields that are added by mongodb
        return res.send(success(200, { ...user._doc, posts }))

    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message));
    }
}

module.exports = {
    followOrUnfollowUserController,
    getPostOfFollowing,
    getMyPosts,
    getUserPosts,
    deleteMyProfile,
    getMyInfo,
    updateUserProfile,
    getUserProfile
}