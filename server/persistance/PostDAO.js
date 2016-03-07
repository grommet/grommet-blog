// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import mkdirp from 'mkdirp';
import path from 'path';
import fs from 'fs';

export default class PostDAO {
  constructor (postFolderName, content, metadata, coverImage) {
    this.postFolderName = postFolderName;
    this.content = content;
    this.metadata = metadata;
    this.coverImage = coverImage;

    this.add = this.add.bind(this);
    this._addMetadata = this._addMetadata.bind(this);
    this._addContent = this._addContent.bind(this);
    this._addCover = this._addCover.bind(this);
  }

  _addCover (err) {
    if (err) {
      this.reject(err);
    } else {
      let extension = this.coverImage.name.split('.')[1];
      let coverFile = path.join(this.postFolder, `cover.${extension}`);
      fs.writeFile(
        coverFile,
        this.coverImage.data,
        'binary', (err) => {
          if (err) {
            this.reject(err);
          } else {
            this.resolve();
          }
        }
      );
    }
  }

  _addContent (err) {
    if (err) {
      this.reject(err);
    } else {
      let contentFile = path.join(this.postFolder, 'content.md');

      fs.writeFile(
        contentFile,
        this.content,
        this._addCover
      );
    }
  }

  _addMetadata (err) {
    if (err) {
      this.reject(err);
    } else {
      let metadataFile = path.join(this.postFolder, 'metadata.json');
      fs.writeFile(
        metadataFile,
        JSON.stringify(this.metadata, null, 2),
        this._addContent
      );
    }
  }

  add (root) {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.postFolder = path.join(root, `server/posts/${this.postFolderName}`);
      mkdirp(this.postFolder, this._addMetadata);
    });
  }
};
