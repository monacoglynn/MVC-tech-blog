const router = require('express').Router();
const colors = require('colors');
const withAuth = require('../utils/auth');
const {
    User,
    Comment,
    Post
} = require('../models');


//this is the general route to render the homepage.
router.get('/', async (req, res) => {
    try {
        //grab all the post data from db
        const postData = await Post.findAll({
            include: [{
                model: User,
                attributes: ['name']
            }],
            order: [
                ['date_created', 'DESC']
            ]
        });
        //creates an array of all the blog posts to display on front page
        const posts = postData.map((post) => post.get({
            plain: true
        }));
        //render homepage.
        console.log(`${req.method} request for homepage`.brightYellow)
        res.render('homepage', {
            posts,
            logged_in: req.session.logged_in
        });
    } catch (err) {
        console.error(err.brightRed);
        res.status(500).json(err);
    }
});

router.get('/profile', withAuth, async (req, res) => {
    try {
        const userData = await User.findByPk(req.session.user_id, {
            attributes: {
                exclude: ['password']
            }
        });
        const user = userData.get({
            plain: true
        });
        const postData = await Post.findAll({
            where: {
                user_id: req.session.user_id
            },
            include: [{
                model: User,
                attributes: ['name']
            }]
        });
        //creates an array of all the users blog posts to display on their profile
        const posts = postData.map((post) => post.get({
            plain: true
        }));
        console.log('GET request to display users posts on their profile'.brightYellow);
        res.render('profile', {
            ...user,
            posts,
            logged_in: true
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/post/:id', async (req, res) => {
    try {
        const postData = await Post.findByPk(req.params.id, {
            include: [{
                model: User,
                attributes: ['name']
            }]
        });


        const post = postData.get({
            plain: true
        });

        res.render('comment', {
            post,
            logged_in: req.session.logged_in
        });
    } catch (err) {
        res.status(500).json(err);
    }
});


//this route renders the login page.
router.get('/login', (req, res) => {
    console.log(`${req.method} to /login path`.brightYellow)
    if (req.session.logged_in) {
        res.redirect('/profile');
        return;
    }
    res.render('login');
});


module.exports = router;