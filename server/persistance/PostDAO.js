// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import mkdirp from 'mkdirp';
import moment from 'moment';
import path from 'path';
import fs from 'fs';

export default class PostDAO {
  constructor (postFolderName, content, metadata, images) {
    this.postFolderName = postFolderName;
    this.content = content;
    this.metadata = {...metadata};

    if (images) {
      images.some((image) => {
        if (image.cover) {
          this.metadata.coverImage = image.name;
          return true;
        }
      });
    }

    this.images = images || [];

    this.add = this.add.bind(this);
    this.edit = this.edit.bind(this);
    this._addMetadata = this._addMetadata.bind(this);
    this._addContent = this._addContent.bind(this);
    this._addImages = this._addImages.bind(this);
    this._editImages = this._editImages.bind(this);
    this._deleteImages = this._deleteImages.bind(this);
  }

  _addImages () {
    return new Promise((resolve, reject) => {
      if (this.images) {
        this.images.forEach((image, index) => {
          const imageFolder = path.join(this.postFolder, 'images');
          if (!fs.existsSync(imageFolder)) {
            fs.mkdirSync(imageFolder);
          }
          const imageFile = path.join(imageFolder, image.name);
          fs.writeFile(
            imageFile,
            image.data,
            'binary', (err) => {
              if (err) {
                reject(err);
                return false;
              } else if (index === this.images.length - 1) {
                resolve();
              }
            }
          );
        });
      } else {
        resolve();
      }
    });
  }

  _deleteImages () {
    const newImages = this.images.map((image) => image.name);
    return new Promise((resolve, reject) => {
      const imageFolder = path.join(this.postFolder, 'images');
      if (fs.existsSync(imageFolder)) {
        let originalImages = fs.readdirSync(imageFolder);
        if (!originalImages || originalImages.length === 0) {
          resolve();
        } else {
          originalImages.forEach((image, index) => {
            if (newImages.indexOf(image) === -1) {
              fs.unlink(path.join(imageFolder, image), (err) => {
                if (err) {
                  reject(err);
                } else if (index === originalImages.length - 1) {
                  resolve();
                }
              });
            } else if (index === originalImages.length - 1) {
              resolve();
            };
          });
        }
      } else {
        resolve();
      }
    });
  }

  _editImages () {
    return new Promise((resolve, reject) => {
      this._deleteImages().then(() => {
        if (this.images.length > 0) {
          this.images.forEach((image, index) => {
            if (image.data) {
              const imageFolder = path.join(this.postFolder, 'images');
              if (!fs.existsSync(imageFolder)) {
                fs.mkdirSync(imageFolder);
              }
              const imageFile = path.join(imageFolder, image.name);
              fs.writeFile(
                imageFile,
                image.data,
                'binary', (err) => {
                  if (err) {
                    reject(err);
                    return false;
                  } else if (index === this.images.length - 1) {
                    resolve();
                  }
                }
              );
            } else if (index === this.images.length - 1) {
              resolve();
            }
          });
        } else {
          resolve();
        }
      }, reject);
    });
  }

  _addContent () {
    return new Promise((resolve, reject) => {
      let contentFile = path.join(this.postFolder, 'content.md');

      fs.writeFile(
        contentFile,
        this.content,
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

  _addMetadata () {
    return new Promise((resolve, reject) => {
      let metadataFile = path.join(this.postFolder, 'metadata.json');
      fs.writeFile(
        metadataFile,
        JSON.stringify(this.metadata, null, 2),
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

  add (root) {
    return new Promise((resolve, reject) => {
      this.postFolder = path.join(root, `server/posts/${this.postFolderName}`);
      mkdirp(this.postFolder, (err) => {
        if (err) {
          reject(err);
        } else {
          let promises = [];
          promises.push(this._addMetadata());
          promises.push(this._addContent());
          promises.push(this._addImages());

          Promise.all(promises).then(resolve, reject);
        }
      });
    });
  }

  edit (root) {
    return new Promise((resolve, reject) => {
      this.postFolder = path.join(root, `server/posts/${this.postFolderName}`);

      const createdDate = moment(this.metadata.createdAt);
      const previousDateFormat = createdDate.format('YYYY-MM-DD');
      const idDateFormat = createdDate.format('YYYY/MM/DD');

      let titleGroups = this.metadata.id.split('/');
      let previousTitleId = titleGroups[titleGroups.length - 1];
      const previousFolderName = `${previousDateFormat}__${previousTitleId}`;

      let previousFolder = (
        path.join(root, `server/posts/${previousFolderName}`)
      );

      let newFolder = (
        path.join(root, `server/posts/${this.postFolderName}`)
      );

      const titleId = this.metadata.title.replace(/ /g, '-').toLowerCase();
      this.metadata.id = `${idDateFormat}/${titleId}`;

      console.log(previousFolder);
      if (fs.existsSync(previousFolder)) {
        if (previousFolder !== newFolder) {
          fs.renameSync(previousFolder, newFolder);
        }
        this.get(newFolder, 'metadata.json').then((previousMetadata) => {
          this.metadata = {...previousMetadata, ...this.metadata};

          let promises = [];
          promises.push(this._addMetadata());
          promises.push(this._addContent());
          promises.push(this._editImages());

          Promise.all(promises).then(resolve, reject);
        }, reject);
      } else {
        reject('Post folder not found.');
      }
    });
  }

  get (root, file) {
    return new Promise((resolve, reject) => {
      fs.readFile(
        path.join(root, file),
        'utf8',
        (err, post) => {
          if (err) {
            reject(err);
          } else {
            resolve(JSON.parse(post));
          }
        }
      );
    });
  }

  getById (id) {
    return new Promise((resolve, reject) => {
      getAll().then((posts) => {
        let matchingPost;
        posts.some((post) => {
          if (post.id === id) {
            matchingPost = post;
            return true;
          }
        });

        resolve(matchingPost);
      }, reject);
    });
  }

  getAll () {
    const root = path.resolve(__dirname, '../posts');
    return new Promise((resolve, reject) => {
      let posts = [];
      fs.readdirSync(root).forEach((postFolder) => {
        const postRoot = path.join(root, postFolder);
        if (fs.lstatSync(postRoot).isDirectory()) {
          const metadataFilename = path.join(postRoot, 'metadata.json');
          const contentFilename = path.join(postRoot, 'content.md');

          const metadata = JSON.parse(fs.readFileSync(metadataFilename, 'utf8'));
          const content = fs.readFileSync(contentFilename, 'utf8');

          metadata.tags = metadata.tags.join(', ').trim();

          let coverImagePath;
          if (metadata.coverImage) {
            let imagePath = encodeURIComponent(metadata.coverImage);
            coverImagePath = (
              `/api/post/img/${postFolder}/images/${imagePath}`
            );
          }

          let imageFolder = path.join(postRoot, 'images');
          let images = [];
          if (fs.existsSync(imageFolder)) {
            fs.readdirSync(imageFolder).forEach((image, index) => {
              images.push({
                id: index,
                name: image,
                cover: image === metadata.coverImage,
                url: (
                  `/api/post/img/${postFolder}/images/${image}`
                )
              });
            });
          }

          posts.push({
            ...metadata,
            coverImage: coverImagePath,
            content: content,
            images: images
          });

        }
      });

      resolve(posts.reverse());
    });
  }
};
