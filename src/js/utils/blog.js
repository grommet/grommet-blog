// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

const DEFAULT_TITLE = 'Grommet Blog';

export function setDocumentTitle (title) {
  if (document) {
    if (title && typeof title === 'string') {
      title = `${title} | ${DEFAULT_TITLE}`;
    } else {
      title = DEFAULT_TITLE;
    }
    document.title = title;
  }
}

export function getImageAsBase64 (image) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      resolve(event.target.result);
    }.bind(this);
    reader.readAsDataURL(image.file);
  });
}
