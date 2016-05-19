// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { Router } from 'express';
import basicAuth from 'basic-auth-connect';
import path from 'path';
import mime from 'mime-types';
import fs from 'fs';
import fecha from 'fecha';
import {
  loadPosts,
  postsMonthMap,
  filterPostsMapByMonth,
  buildSearchIndex,
  addPost,
  editPost,
  deletePost,
  getAllPosts,
  cancelChange,
  getPendingPost,
  getImageAsBase64
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

function managePost (req, res, postAction) {
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

  postAction(req.body.content, metadata, images).then(
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
}

router.post('/', auth, function (req, res) {
  managePost(req, res, addPost);
});

router.put('/', auth, function (req, res) {
  managePost(req, res, editPost);
});

router.post('/cancel/', auth, function (req, res) {
  if (process.env.BLOG_PERSISTANCE === 'github') {
    const metadata = {
      action: req.body.action,
      id: req.body.id,
      title: req.body.title,
      createdAt: req.body.createdAt
    };

    cancelChange(metadata).then(
      res.sendStatus(200),
      (err) => res.status(500).json({ error: err.toString() })
    );
  } else {
    res.status(500).json({
      error: 'Cancel change only supported with Github persistance.'
    });
  }
});

router.delete('/*', auth, function (req, res) {
  deletePost(req.params['0']).then(
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
      (allPosts) => {
        allPosts = allPosts.sort((post1, post2) => {
          return new Date(post2.createdAt) - new Date(post1.createdAt);
        });
        res.send(postsMonthMap(allPosts));
      },
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
      let day = fecha.format(new Date(post.createdAt), 'DD');
      return day === req.params.day;
    });

    if (monthPosts[monthLabel].length === 0) {
      delete monthPosts[monthLabel];
    }
  });

  res.send(monthPosts);
});

router.get('/img/*', function (req, res) {
  const imagePath = path.resolve(req.url.split('/img/')[1]);

  if (!fs.existsSync(imagePath) && process.env.BLOG_PERSISTANCE === 'github') {
    //if the image does not exist, it is inside a pull request
    getImageAsBase64(imagePath).then(
      (img) => {
        res.writeHead(200, {
          'Content-Type': mime.lookup(imagePath),
          'Content-Length': img.length
        });
        res.end(img);
      },
      (err) => res.status(500).json({ error: err.toString() }));
  } else {
    res.sendFile(imagePath);
  }
});

router.get(/\d{4}/, function (req, res) {
  let matchingPost;
  const postId = req.url.substring(1).split('?')[0];
  if (process.env.BLOG_PERSISTANCE === 'github' && req.query.manage) {
    getPendingPost(postId).then((pendingPost) => {
      if (pendingPost) {
        res.send(pendingPost);
      } else {
        posts.some((post) => {
          if (post.id === postId) {
            matchingPost = post;
            return true;
          }
        });

        res.send(matchingPost);
      }
    }, (err) => res.status(500).json({ error: err.toString() }));
  } else {
    posts.some((post) => {
      if (post.id === postId) {
        matchingPost = post;
        return true;
      }
    });
    res.send(matchingPost);
  }
});

export default router;
