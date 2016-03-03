// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { browserHistory } from 'react-router';
let history = browserHistory;

// We have our own history implementation so we can insert a prefix.
// This allows sharing web servers and using sub domains with less
// application awareness.

let appPrefix = '';

function addPrefix (location) {
  let result = location;
  if (appPrefix.length > 0) {
    if (typeof location === 'string') {
      if (location.slice(0, appPrefix.length) !== appPrefix) {
        result = (appPrefix + location);
      }
    } else {
      if (location.pathname.slice(0, appPrefix.length) !== appPrefix) {
        result = { ...location, pathname: appPrefix + location.pathname };
      }
    }
  }
  return result;
}

function removePrefix (location) {
  let result = location;
  if (appPrefix.length > 0 &&
    location.pathname.slice(0, appPrefix.length) === appPrefix) {
    result = { ...location, pathname: location.pathname.slice(appPrefix.length) };
  }
  return result;
}

export default {
  ...history,
  listen: (handler) => {
    return history.listen((location) => {
      handler(removePrefix(location));
    });
  },
  push: (location) => {
    history.push(addPrefix(location));
  },
  replace: (location) => {
    history.replace(addPrefix(location));
  },
  prefix: (prefix) => {
    appPrefix = prefix;
  },
  makeHref: (path) => `${appPrefix}${path}`
};
