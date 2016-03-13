// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import express, { Router } from 'express';
import basicAuth from 'basic-auth-connect';
import moment from 'moment';
import path from 'path';
import {
  loadPosts,
  postsMonthMap,
  filterPostsMapByMonth,
  buildSearchIndex,
  addPost,
  editPost,
  getAllPosts
} from './utils/post';

const router = Router();

let posts;
let postsByMonth;
let searchIndex;
loadPosts().then((loadedPosts) => {
  posts = loadedPosts;
  postsByMonth = postsMonthMap(posts);
  searchIndex = buildSearchIndex(posts);
});

function pick(map, match) {
  return Object.assign({}, ...(
    Object.keys(map).map(
      (key) => key.indexOf(match) > -1 ? {[key]: map[key]} : undefined
    )
  ));
}

const USER = process.env.GH_USER || 'grommet';
const USER_PASSWORD = process.env.USER_PASSWORD || 'admin';

const auth = basicAuth(USER, USER_PASSWORD);

router.post('/', auth, function (req, res) {
  const coverName = req.body.cover;

  const metadata = {
    title: req.body.title,
    author: req.body.author,
    tags: (req.body.tags || '').split(',').map((tag) => tag.trim())
  };

  let images = [];
  if (req.files) {
    Object.keys(req.files).forEach((key) => {
      let image = req.files[key];
      if (image.name === coverName) {
        image.cover = true;
        images.push(image);
      }
    });
  }

  addPost(req.body.content, metadata, images).then(
    () => {
      if (process.env.BLOG_PERSISTANCE !== 'github') {
        loadPosts().then((loadedPosts) => {
          posts = loadedPosts;
          postsByMonth = postsMonthMap(posts);
          searchIndex = buildSearchIndex(posts);

          res.sendStatus(200);
        }, (err) => res.status(500).json({ error: err.toString() }));
      } else {
        res.sendStatus(200);
      }
    },
    (err) => res.status(500).json({ error: err.toString() })
  );
});

router.put('/', auth, function (req, res) {
  const coverName = req.body.cover;

  const metadata = {
    id: req.body.id,
    createdAt: req.body.createdAt,
    title: req.body.title,
    author: req.body.author,
    tags: (req.body.tags || '').split(',').map((tag) => tag.trim())
  };

  let images = [];

  if (req.body.images) {
    images = req.body.images.split(',').map((imageName) => {
      let image = {
        name: imageName
      };

      if (imageName === coverName) {
        image.cover = true;
      }
      return image;
    });
  }

  if (req.files) {
    Object.keys(req.files).forEach((key) => {
      let image = req.files[key];
      if (image.name === coverName) {
        image.cover = true;
      }
      images.push(image);
    });
  }

  editPost(req.body.content, metadata, images).then(
    () => {
      if (process.env.BLOG_PERSISTANCE !== 'github') {
        loadPosts().then((loadedPosts) => {
          posts = loadedPosts;
          postsByMonth = postsMonthMap(posts);
          searchIndex = buildSearchIndex(posts);

          res.sendStatus(200);
        }, (err) => res.status(500).json({ error: err.toString() }));
      } else {
        res.sendStatus(200);
      }
    },
    (err) => res.status(500).json({ error: err.toString() })
  );
});

router.get('/', function (req, res) {
  res.send(posts);
});

router.get('/archive/', function (req, res) {
  res.send(postsByMonth);
});

router.get('/manage/', function (req, res) {
  if (process.env.BLOG_PERSISTANCE === 'github') {
    getAllPosts().then(
      (allPosts) => res.send(postsMonthMap(allPosts)),
      (err) => res.status(500).json({ error: err.toString() })
    );
  } else {
    res.send(postsByMonth);
  }

});

router.get('/search/', function (req, res) {
  const matches = searchIndex.search(req.query.q).map(
    (match) => match.ref
  );

  let matchingPosts = [];
  if (matches && matches.length > 0) {
    matchingPosts = posts.filter((post) => matches.includes(post.id));
  }
  res.send(matchingPosts);
});

router.get('/archive/author/:authorName', function (req, res) {
  let authorPosts = posts.filter(
    (post) => post.author.replace(' ', '').toLowerCase() === req.params.authorName
  );

  res.send(postsMonthMap(authorPosts));
});

router.get('/archive/tag/:tagName', function (req, res) {
  let tagPosts = posts.filter(
    (post) => post.tags.includes(req.params.tagName)
  );

  res.send(postsMonthMap(tagPosts));
});

router.get('/archive/:year', function (req, res) {
  res.send(pick(postsByMonth, req.params.year));
});

router.get('/archive/:year/:month', function (req, res) {
  res.send(filterPostsMapByMonth(
    postsByMonth, req.params.year, req.params.month
  ));
});

router.get('/archive/:year/:month/:day', function (req, res) {

  let monthPosts = filterPostsMapByMonth(
    postsByMonth, req.params.year, req.params.month
  );

  Object.keys(monthPosts).forEach((monthLabel) => {
    monthPosts[monthLabel] = monthPosts[monthLabel].filter((post) => {
      let day = moment(post.createdAt).format('DD');
      return day === req.params.day;
    });

    if (monthPosts[monthLabel].length === 0) {
      delete monthPosts[monthLabel];
    }
  });

  res.send(monthPosts);
});

router.use('/img/', express.static(path.resolve(__dirname, 'posts')));

router.get('/*', function (req, res) {
  let matchingPost;
  posts.some((post) => {
    if (post.id === req.params['0']) {
      matchingPost = post;
      return true;
    }
  });
  res.send(matchingPost);
});

export default router;
