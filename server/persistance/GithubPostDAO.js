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

const root = path.resolve('/tmp/grommet-blog');

const TOKEN = process.env.GH_TOKEN;

const github = new GitHubApi({
  version: "3.0.0",
  protocol: "https",
  host: "api.github.com",
  timeout: 5000,
  headers: {
    'user-agent': 'grommet-blog-github-app'
  }
});

github.authenticate({
  type: 'oauth',
  token: TOKEN
});

export default class GithubPostDAO extends PostDAO {
  constructor (postFolderName, content, metadata, coverImage) {
    super(postFolderName, content, metadata, coverImage);

    this._createNewBrach = this._createNewBrach.bind(this);
    this._addPost = this._addPost.bind(this);
    this._commitAndPushPost = this._commitAndPushPost.bind(this);
    this._createPullRequest = this._createPullRequest.bind(this);
  }

  _createPullRequest () {
    github.pullRequests.create({
      user: 'grommet',
      repo: 'grommet-blog',
      title: `Add new post: ${this.postFolderName}`,
      base: 'master',
      head: this.postFolderName
    }, (err) => {
      if (err) {
        this.doneReject(err);
      } else {
        this.doneResolve();
      }
    });
  }

  _commitAndPushPost () {
    return simpleGit(root)
     .outputHandler(function (command, stdout, stderr) {
       stdout.pipe(process.stdout);
       stderr.pipe(process.stderr);
     })
     .addConfig('user.name', 'grommet-github-bot')
     .addConfig('user.email', 'asouza@hpe.com')
     .add(`server/posts/${this.postFolderName}`)
     .commit(`Add new post: ${this.postFolderName}`)
     .push('origin', this.postFolderName)
     .then(this._createPullRequest, this.doneReject);
  }

  _addPost () {
    return super.add(root).then(this._commitAndPushPost, this.doneReject);
  }

  _createNewBrach () {
    return simpleGit(root).checkoutBranch(
      this.postFolderName, 'master'
    ).then(this._addPost, this.doneReject);
  }

  add () {
    return new Promise((resolve, reject) => {
      del.sync([root], { force: true });
      this.doneResolve = resolve;
      this.doneReject = reject;
      return simpleGit().clone(
        `https://${TOKEN}@github.com/grommet/grommet-blog.git`,
        root
      ).then(this._createNewBrach, this.doneReject);
    });
  }
}
