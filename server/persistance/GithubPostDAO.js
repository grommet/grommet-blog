// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import path from 'path';
import simpleGit from 'simple-git';
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
    console.log('###', 'GithubPostDAO._createPullRequest');
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
    console.log('###', 'GithubPostDAO._commitAndPushPost');
    return simpleGit(root)
     .add(`server/posts/${this.postFolderName}`)
     .commit(`Add new post: ${this.postFolderName}`)
     .push('origin', this.postFolderName)
     .then(this._createPullRequest);
  }

  _addPost () {
    console.log('###', 'GithubPostDAO._addPost');
    return super.add(root).then(this._commitAndPushPost);
  }

  _createNewBrach (repository) {
    console.log('###', 'GithubPostDAO._createNewBrach');
    return simpleGit(root).checkoutBranch(
      this.postFolderName, 'master'
    ).then(this._addPost);
  }

  add () {
    console.log('###', 'GithubPostDAO.add');
    return new Promise((resolve, reject) => {
      del.sync([root], { force: true });
      this.doneResolve = resolve;
      this.doneReject = reject;
      return simpleGit().clone(
        `https://${TOKEN}@github.com/grommet/grommet-blog.git`,
        root
      ).then(this._createNewBrach);
    });
  }
}
