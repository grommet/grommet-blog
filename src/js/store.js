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

  getPost (id) {
    return new Promise((resolve, reject) => {
      Rest.get(`${appContext}/api/post/${id}`).end((err, res) => {
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
  }
};
