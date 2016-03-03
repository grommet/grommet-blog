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
};
