// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import path from 'path';

//TODO: temporary
import Git from 'simple-git/src/git';
Git.prototype.addConfig = function (key, value, then) {
  return this._run(['config', '--local', key, value], function (err, data) {
    if (then) {
      let cb =  this._parseCheckout(data);
      then(err, !err && cb);
    }
  });
};
import ChildProcess from 'child_process';
import { Buffer } from 'buffer';

let simpleGit = function (baseDir) {
  return new Git(baseDir || process.cwd(), ChildProcess, Buffer);
};

import GitHubApi from 'github';
import del from 'del';

import PostDAO from './PostDAO';

const PROJECT_NAME = process.env.GH_PROJECT || 'grommet-blog';
const USER = process.env.GH_USER || 'grommet';
const USER_NAME = process.env.GIT_USERNAME || 'grommet-github-bot';
const USER_EMAIL = process.env.GIT_USER_EMAIL || 'grommet@hpe.com';
const TOKEN = process.env.GH_TOKEN;

const root = path.resolve(`/tmp/${PROJECT_NAME}`);

const github = new GitHubApi({
  version: "3.0.0",
  protocol: "https",
  host: "api.github.com",
  timeout: 5000,
  headers: {
    'user-agent': `${PROJECT_NAME}-github-app`
  }
});

const BASE_GITHUB_CONFIG = {
  user: USER,
  repo: PROJECT_NAME,
  base: 'master'
};

github.authenticate({
  type: 'oauth',
  token: TOKEN
});

export default class GithubPostDAO extends PostDAO {
  constructor (postFolderName, content, metadata, coverImage) {
    super(postFolderName, content, metadata, coverImage);

    this._clone = this._clone.bind(this);
    this._createNewBranch = this._createNewBranch.bind(this);
    this._addPost = this._addPost.bind(this);
    this._commitAndPushPost = this._commitAndPushPost.bind(this);
    this._createPullRequest = this._createPullRequest.bind(this);
    this._mapPosts = this._mapPosts.bind(this);
    this._loadPostMetadata = this._loadPostMetadata.bind(this);
  }

  _createPullRequest (resolve, reject) {
    github.pullRequests.create({
      ...BASE_GITHUB_CONFIG,
      title: `Add new post: ${this.postFolderName}`,
      head: this.postFolderName
    }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }

  _commitAndPushPost (resolve, reject) {
    return simpleGit(root)
     .outputHandler(function (command, stdout, stderr) {
       stdout.pipe(process.stdout);
       stderr.pipe(process.stderr);
     })
     .addConfig('user.name', USER_NAME)
     .addConfig('user.email', USER_EMAIL)
     .add(`server/posts/${this.postFolderName}`)
     .commit(`Add new post: ${this.postFolderName}`)
     .push('origin', this.postFolderName)
     .then(this._createPullRequest.bind(this, resolve, reject), reject);
  }

  _addPost (resolve, reject) {
    return super.add(root)
      .then(this._commitAndPushPost.bind(this, resolve, reject), reject);
  }

  _createNewBranch (resolve, reject) {
    return simpleGit(root).checkoutLocalBranch(
      this.postFolderName
    ).then(this._addPost.bind(this, resolve, reject), reject);
  }

  _clone () {
    del.sync([root], { force: true });
    return simpleGit().clone(
      `https://${TOKEN}@github.com/${USER}/${PROJECT_NAME}.git`,
      root
    );
  }

  add () {
    return new Promise((resolve, reject) => {
      this._clone().then(
        this._createNewBranch.bind(this, resolve, reject),
        reject
      );
    });
  }

  _loadPostMetadata (postTitle) {
    return new Promise((resolve, reject) => {
      let root = path.resolve(`/tmp/${postTitle}/${PROJECT_NAME}`);
      del.sync([root], { force: true });
      simpleGit()
        .clone(
          `https://${TOKEN}@github.com/${USER}/${PROJECT_NAME}.git`,
          root
        ).then(() => {
          simpleGit(root)
            .checkout(postTitle)
            .then(() => {
              super.get(root, `${postTitle}/metadata.json`).then(resolve, reject);
            });
        });
    });
  }

  _mapPosts (pendingPostsTitle, resolve, reject) {
    let posts = [];
    let promises = [];

    pendingPostsTitle.forEach((postTitle, index) => {
      let promise = this._loadPostMetadata(postTitle, resolve, reject);
      promises.push(promise);
      promise.then((post) => {
        post.pending = true;
        posts.push(post);
      }, reject);
    });

    Promise.all(promises).then(function() {
      resolve(posts);
    });
  }

  getPending () {
    return new Promise((resolve, reject) => {
      github.pullRequests.getAll({
        ...BASE_GITHUB_CONFIG,
        'state': 'open',
        'per_page': 100
      }, (err, openPullRequests) => {
        if (err) {
          reject(err);
        } else {
          const titleRegex = /Add new post: (.*)$/;
          const pendingPostsTitle = openPullRequests
            .filter(
              (pullRequest) => titleRegex.exec(pullRequest.title)
            ).map(
              (pullRequest) => titleRegex.exec(pullRequest.title)[1]
            );

          if (pendingPostsTitle && pendingPostsTitle.length > 0) {
            this._mapPosts(pendingPostsTitle, resolve, reject);
          } else {
            resolve([]);
          }
        }
      });
    });
  }
}
