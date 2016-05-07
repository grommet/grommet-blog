// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import path from 'path';
import fecha from 'fecha';
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
    let monthLabel = fecha.format(
      new Date(post.createdAt), 'MMMM, YYYY'
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
  let monthLabel = fecha.format(
    new Date(year, month - 1), 'MMMM, YYYY'
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
  const titleId = metadata.title
    .replace(/ /g, '-').replace(/[^a-zA-Z0-9\-]/g, '').toLowerCase();

  const today = new Date();
  const idDateFormat = fecha.format(today, 'YYYY/MM/DD');
  const folderDateFormat = fecha.format(today, 'YYYY-MM-DD');

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
  const titleId = metadata.title
    .replace(/ /g, '-').replace(/[^a-zA-Z0-9\-]/g, '').toLowerCase();
  const folderDateFormat = fecha.format(
    new Date(metadata.createdAt), 'YYYY-MM-DD'
  );
  const postFolderName = `${folderDateFormat}__${titleId}`;

  if (process.env.BLOG_PERSISTANCE === 'github') {
    return new GithubPostDAO(postFolderName, content, metadata, images).edit();
  } else {
    return new PostDAO(postFolderName, content, metadata, images).edit(
      path.resolve(path.join(__dirname, '../../'))
    );
  }
}

function getPostFolderName (id) {
  const idGroup = id.split('/');
  const postTitle = idGroup[idGroup.length - 1];
  idGroup.pop();
  const postDate = idGroup.join('-');
  return `${postDate}__${postTitle}`;
}
export function deletePost (id) {
  const postFolderName = getPostFolderName(id);
  if (process.env.BLOG_PERSISTANCE === 'github') {
    return new GithubPostDAO(postFolderName).delete();
  } else {
    return new PostDAO(postFolderName).delete(
      path.resolve(path.join(__dirname, '../../'))
    );
  }
}

export function getAllPosts () {
  return new GithubPostDAO().getAll();
}

export function cancelChange (post) {
  const titleId = post.title
    .replace(/ /g, '-').replace(/[^a-zA-Z0-9\-]/g, '').toLowerCase();
  const folderDateFormat = fecha.format(
    new Date(post.createdAt), 'YYYY-MM-DD'
  );
  const postFolderName = `${folderDateFormat}__${titleId}`;
  return new GithubPostDAO(postFolderName).cancelChange(post.action);
}

export function getPendingPost (id) {
  const postFolderName = getPostFolderName(id);
  return new GithubPostDAO(postFolderName).getPending();
}

export function getImageAsBase64 (imagePath) {
  const postPath = imagePath.split('server/posts/')[1];
  const postFolderGroup = postPath.split('/images/');
  const postFolderName = postFolderGroup[0];
  const imageName = decodeURI(postFolderGroup[1]);
  return new GithubPostDAO(postFolderName).getImageAsBase64(imageName);
}
