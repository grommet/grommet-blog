// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import moment from 'moment';
import lunr from 'lunr';

import GithubPostDAO from '../persistance/GithubPostDAO';
import PostDAO from '../persistance/PostDAO';

export function loadPosts () {
  const root = path.resolve(__dirname, '../posts');
  let posts = [];
  fs.readdirSync(root).forEach((postFolder) => {
    const postRoot = path.join(root, postFolder);
    if (fs.lstatSync(postRoot).isDirectory()) {
      const metadataFilename = path.join(postRoot, 'metadata.json');
      const contentFilename = path.join(postRoot, 'content.md');
      const imageFilename = glob.sync('**cover.**', { cwd: postRoot })[0];

      const metadata = JSON.parse(fs.readFileSync(metadataFilename, 'utf8'));
      const content = fs.readFileSync(contentFilename, 'utf8');

      let coverImagePath;
      if (imageFilename) {
        coverImagePath = `/api/post/img/${postFolder}/${imageFilename}`;
      }

      posts.push({
        coverImage: coverImagePath,
        content: content,
        ...metadata
      });
    }
  });

  return posts.reverse();
}

export function getPostById (id) {
  let posts = loadPosts ();

  let matchingPost;
  posts.some((post) => {
    if (post.id === id) {
      matchingPost = post;
      return true;
    }
  });

  return matchingPost;
}

export function postsMonthMap (posts) {
  return posts.reduce((postMap, post) => {
    let monthLabel = moment(post.createdAt).format(
      'MMMM, YYYY'
    );
    if (postMap.hasOwnProperty(monthLabel)) {
      postMap[monthLabel].push(post);
    } else {
      postMap[monthLabel] = [post];
    }
    return postMap;
  }, {});
}

export function filterPostsMapByMonth (postsByMonth, year, month) {
  let monthLabel = moment([year, month - 1]).format(
    'MMMM, YYYY'
  );

  let archive = {};
  if (monthLabel in postsByMonth) {
    archive[monthLabel] = postsByMonth[monthLabel];
  }

  return archive;
}

export function buildSearchIndex (posts) {
  const index = lunr(function () {
    this.field('title', {boost: 10});
    this.field('author', {boost: 2});
    this.field('content', {boost: 5});
    this.field('tags');
    this.ref('id');
  });

  posts.forEach((post) => index.add(post));

  return index;
}

export function addPost (content, metadata, coverImage) {
  const titleId = metadata.title.replace(/ /g, '-').toLowerCase();

  const today = moment();
  const idDateFormat = today.format('YYYY/MM/DD');
  const folderDateFormat = today.format('YYYY-MM-DD');

  metadata.id = `${idDateFormat}/${titleId}`;
  const postFolderName = `${folderDateFormat}__${titleId}`;

  if (process.env.BLOG_PERSISTANCE === 'github') {
    return new GithubPostDAO(postFolderName, content, metadata, coverImage).add();
  } else {
    return new PostDAO(postFolderName, content, metadata, coverImage).add(
      path.resolve(path.join(__dirname, '../../'))
    );
  }
}

export function getPendingPosts () {
  return new GithubPostDAO().getPending();
}
