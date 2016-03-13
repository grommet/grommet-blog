// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import path from 'path';
import moment from 'moment';
import lunr from 'lunr';

import GithubPostDAO from '../persistance/GithubPostDAO';
import PostDAO from '../persistance/PostDAO';

export function loadPosts () {
  return new PostDAO().getAll();
}

export function getPostById (id) {
  return new PostDAO().getById(id);
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

export function addPost (content, metadata, images) {
  const titleId = metadata.title.replace(/ /g, '-').toLowerCase();

  const today = moment();
  const idDateFormat = today.format('YYYY/MM/DD');
  const folderDateFormat = today.format('YYYY-MM-DD');

  metadata.id = `${idDateFormat}/${titleId}`;
  metadata.createdAt = today;
  const postFolderName = `${folderDateFormat}__${titleId}`;

  if (process.env.BLOG_PERSISTANCE === 'github') {
    return new GithubPostDAO(postFolderName, content, metadata, images).add();
  } else {
    return new PostDAO(postFolderName, content, metadata, images).add(
      path.resolve(path.join(__dirname, '../../'))
    );
  }
}

export function editPost (content, metadata, images) {
  const titleId = metadata.title.replace(/ /g, '-').toLowerCase();
  console.log(metadata.createdAt, moment(metadata.createdAt).format('YYYY-MM-DD'));
  const folderDateFormat = moment(metadata.createdAt).format('YYYY-MM-DD');
  const postFolderName = `${folderDateFormat}__${titleId}`;

  if (process.env.BLOG_PERSISTANCE === 'github') {
    return new GithubPostDAO(postFolderName, content, metadata, images).edit();
  } else {
    return new PostDAO(postFolderName, content, metadata, images).edit(
      path.resolve(path.join(__dirname, '../../'))
    );
  }
}

export function getAllPosts () {
  return new GithubPostDAO().getAll();
}
