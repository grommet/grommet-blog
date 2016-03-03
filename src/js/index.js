// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import '../scss/index.scss';

import React from 'react';
import { render } from 'react-dom';
import { match } from 'react-router';

import routes from './routes';
import history from './RouteHistory';
import BlogContext from './BlogContext';

let element = document.getElementById('content');

let asyncData;
let asyncDataNode = document.getElementById('asyncData');
if (asyncDataNode) {
  asyncData = JSON.parse(asyncDataNode.textContent);
}

match({ history, routes }, (error, redirectLocation, renderProps) => {
  render(
    <BlogContext renderProps={renderProps} asyncData={asyncData} />, element
  );
});

document.body.classList.remove('loading');
