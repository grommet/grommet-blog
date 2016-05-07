// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import Rest from 'grommet/utils/Rest';

let appContext = '';
let useContext = true;

export default {
  getPosts () {
    return new Promise((resolve, reject) => {
      Rest.get(`${appContext}/api/post/`).end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body);
        }
      });
    });
  },

  getPost (id, manage) {
    return new Promise((resolve, reject) => {
      let manageQuery = '';
      if (manage) {
        manageQuery = '?manage=true';
      }
      Rest.get(`${appContext}/api/post/${id}${manageQuery}`).end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body);
        }
      });
    });
  },

  getArchive (archivePath = '/archive') {
    return new Promise((resolve, reject) => {
      Rest.get(`${appContext}/api/post${archivePath}`).end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body);
        }
      });
    });
  },

  search (value = '') {
    const query = value.replace(' ', '+');
    return new Promise((resolve, reject) => {
      Rest.get(`${appContext}/api/post/search?q=${query}`).end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body);
        }
      });
    });
  },

  addContext (context) {
    appContext = context;
  },

  useContext () {
    return useContext;
  },

  setUseContext (context) {
    useContext = context;
  },

  addPost (post) {
    return new Promise((resolve, reject) => {
      let postRest = Rest.post(`${appContext}/api/post/`)
      .field('title', post.title)
      .field('author', post.author)
      .field('tags', post.tags || '')
      .field('content', post.content);

      if (post.images) {
        post.images.forEach((image) => {
          if (image.cover) {
            postRest.field('cover', image.name);
          }
          postRest.attach(image.name, image.file, image.name);
        });
      }

      postRest.end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body);
        }
      });
    });
  },

  editPost (post) {
    return new Promise((resolve, reject) => {
      let putRest = Rest.put(`${appContext}/api/post/`)
      .field('id', post.id)
      .field('createdAt', post.createdAt)
      .field('title', post.title)
      .field('author', post.author)
      .field('tags', post.tags || '')
      .field('content', post.content);

      let unchangedImages = [];
      if (post.images) {
        post.images.forEach((image) => {
          if (image.cover) {
            putRest.field('cover', image.name);
          }

          if (image.file) {
            putRest.attach(image.name, image.file, image.name);
          } else {
            unchangedImages.push(image.name);
          }
        });
      }

      if (unchangedImages) {
        putRest.field('images', unchangedImages.join());
      }

      putRest.end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body);
        }
      });
    });
  },

  cancelChange (post) {
    return new Promise((resolve, reject) => {
      const cancelChangeRest = Rest.post(`${appContext}/api/post/cancel`)
        .field('action', post.action)
        .field('id', post.id)
        .field('title', post.title)
        .field('createdAt', post.createdAt);
      cancelChangeRest.end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body);
        }
      });
    });
  },

  deletePost (post) {
    return new Promise((resolve, reject) => {
      Rest.del(`${appContext}/api/post/${post.id}`).end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body);
        }
      });
    });
  }
};
