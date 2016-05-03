// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import path from 'path';
import fs from 'fs-extra';

//TODO: temporary
import Git from 'simple-git/src/git';
Git.prototype.delete = function (remote, branch, then) {
  var command = ["push"];
  if (typeof remote === 'string' && typeof branch === 'string') {
    command.push(remote, '--delete', branch);
  }
  if (typeof arguments[arguments.length - 1] === 'function') {
    then = arguments[arguments.length - 1];
  }

  return this._run(command, (err, data) => then && then(err, !err && data));
};

Git.prototype.fetch = function (remote, branch, then) {
  var command = ["fetch", "--prune"];
  if (typeof remote === 'string' && typeof branch === 'string') {
    command.push(remote, branch);
  }
  if (typeof arguments[arguments.length - 1] === 'function') {
    then = arguments[arguments.length - 1];
  }

  return this._run(command, (err, data) => then && then(err, !err && this._parseFetch(data)));
};
Git.prototype.checkoutLocalBranch = function (branchName, then) {
  return this._run(['checkout', '-B', branchName],
    (err, data) => then && then(err, !err && this._parseCheckout(data)));
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

const ROOT = path.resolve(`/tmp/${PROJECT_NAME}`);

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

if (process.env.BLOG_PERSISTANCE === 'github') {
  github.authenticate({
    type: 'oauth',
    token: TOKEN
  });
}

export default class GithubPostDAO extends PostDAO {
  constructor (postFolderName, content, metadata, images) {
    super(postFolderName, content, metadata, images);

    this._cloneOrUpdate = this._cloneOrUpdate.bind(this);
    this._createNewBranch = this._createNewBranch.bind(this);
    this._commitAndPushPost = this._commitAndPushPost.bind(this);
    this._createPullRequest = this._createPullRequest.bind(this);
    this._mapPosts = this._mapPosts.bind(this);
    this._loadPostMetadata = this._loadPostMetadata.bind(this);
    this.getAll = this.getAll.bind(this);
  }

  _createPullRequest (action) {
    return new Promise((resolve, reject) => {
      github.pullRequests.create({
        ...BASE_GITHUB_CONFIG,
        title: `${action} post: ${this.postFolderName}`,
        head: `${action}_${this.postFolderName}`
      }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  _commitAndPushPost (action) {
    return new Promise((resolve, reject) => {
      simpleGit(ROOT)
       .outputHandler(function (command, stdout, stderr) {
         stdout.pipe(process.stdout);
         stderr.pipe(process.stderr);
       })
       .addConfig('user.name', USER_NAME)
       .addConfig('user.email', USER_EMAIL)
       .add(['--all', '.'])
       .commit(`${action} post: ${this.postFolderName}`)
       .pull('origin', 'master')
       .push('origin', `${action}_${this.postFolderName}`, (err) => {
         if (err) {
           reject(err);
         } else {
           resolve();
         }
       });
    });
  }

  _createNewBranch (action) {
    return new Promise((resolve, reject) => {
      simpleGit(ROOT).checkoutLocalBranch(
        `${action}_${this.postFolderName}`, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  _cloneOrUpdate () {
    try {
      fs.accessSync(ROOT, fs.F_OK);
      return new Promise((resolve, reject) => {
        simpleGit(ROOT).fetch((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (e) {
      return new Promise((resolve, reject) => {
        simpleGit().clone(
          `https://${TOKEN}@github.com/${USER}/${PROJECT_NAME}.git`,
          ROOT,
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    }
  }

  _loadPostMetadata (post) {
    return new Promise((resolve, reject) => {
      let postBranch = `${post.action}_${post.title}`;
      const postRoot = path.resolve(`/tmp/${postBranch}/${PROJECT_NAME}`);
      del.sync([postRoot], { force: true });
      fs.copy(ROOT, postRoot, (err) => {
        if (err) {
          reject(err);
        } else {
          if (post.action === 'Delete') {
            simpleGit(postRoot)
              .then(() => {
                super.get(postRoot, `server/posts/${post.title}/metadata.json`).then(resolve, reject);
              });
          } else {
            simpleGit(postRoot)
              .checkout(postBranch)
              .then(() => {
                super.get(postRoot, `server/posts/${post.title}/metadata.json`).then(resolve, reject);
              });
          }
        }
      });
    });
  }

  _mapPosts (pendingPostsPR) {
    return new Promise((resolve, reject) => {
      let posts = [];
      let promises = [];

      pendingPostsPR.forEach((post, index) => {
        const action = post.action;
        let promise = this._loadPostMetadata(post, resolve, reject);
        promises.push(promise);
        promise.then((post) => {
          post.pending = true;
          post.action = action;
          posts.push(post);
        }, reject);
      });

      Promise.all(promises).then(function() {
        resolve(posts);
      }, reject);
    });
  }

  add () {
    return new Promise((resolve, reject) => {
      this._cloneOrUpdate()
        .then(this._createNewBranch.bind(this, 'Add'), reject)
        .then(super.add.bind(this, ROOT), reject)
        .then(this._commitAndPushPost.bind(this, 'Add'), reject)
        .then(this._createPullRequest.bind(this, 'Add'), reject)
        .then(resolve, reject);
    });
  }

  edit () {
    return new Promise((resolve, reject) => {
      this._cloneOrUpdate()
        .then(this._createNewBranch.bind(this, 'Edit'), reject)
        .then(super.edit.bind(this, ROOT), reject)
        .then(this._commitAndPushPost.bind(this, 'Edit'), reject)
        .then(this._createPullRequest.bind(this, 'Edit'), reject)
        .then(resolve, reject);
    });
  }

  delete () {
    return new Promise((resolve, reject) => {
      this._cloneOrUpdate()
        .then(this._createNewBranch.bind(this, 'Delete'), reject)
        .then(super.delete.bind(this, ROOT), reject)
        .then(this._commitAndPushPost.bind(this, 'Delete'), reject)
        .then(this._createPullRequest.bind(this, 'Delete'), reject)
        .then(resolve, reject);
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
          const titleRegex = /(Add|Edit|Delete) post: (.*)$/;
          const pendingPostsPR = openPullRequests
            .filter(
              (pullRequest) => titleRegex.exec(pullRequest.title)
            ).map(
              (pullRequest) => {
                return {
                  action: titleRegex.exec(pullRequest.title)[1],
                  title: titleRegex.exec(pullRequest.title)[2]
                };
              }
            );

          if (pendingPostsPR && pendingPostsPR.length > 0) {
            this._cloneOrUpdate().then(() => {
              this._mapPosts(pendingPostsPR).then(resolve, reject);
            }, reject);
          } else {
            resolve([]);
          }
        }
      });
    });
  }

  getAll () {
    return new Promise((resolve, reject) => {
      this.getPending().then((pending) => {
        super.getAll().then((posts) => {
          let pendingTitles = pending.map((post) => post.title);
          posts = posts.filter(
            (post) => pendingTitles.indexOf(post.title) === -1
          );
          resolve([...posts, ...pending]);
        }, reject);
      }, reject);
    });
  }

  cancelChange (action) {
    return new Promise((resolve, reject) => {
      github.pullRequests.getAll({
        ...BASE_GITHUB_CONFIG,
        state: 'open',
        'per_page': 100,
        sort: 'created'
      }, (err, pullRequests) => {
        if (err) {
          reject(err);
        } else {
          const title = `${action} post: ${this.postFolderName}`;
          const hasPR = pullRequests.some((pullRequest) => {
            if (pullRequest.title === title) {
              github.pullRequests.update({
                ...BASE_GITHUB_CONFIG,
                title: title,
                head: `${action}_${this.postFolderName}`,
                state: 'closed',
                number: pullRequest.number
              }, (err) => {
                if (err) {
                  reject(err);
                } else {
                  simpleGit(ROOT)
                   .addConfig('user.name', USER_NAME)
                   .addConfig('user.email', USER_EMAIL)
                   .delete('origin', `${action}_${this.postFolderName}`,
                     (err) => {
                       if (err) {
                         reject(err);
                       } else {
                         resolve();
                       }
                     }
                   );
                }
              });

              return true;
            }
          });

          if (!hasPR) {
            reject(`Could not find PR: ${title}`);
          }
        }
      });
    });
  }
}
