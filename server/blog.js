// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import compression from 'compression';
import express from 'express';
import http from 'http';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import path from 'path';
import post from './post';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import sass from 'node-sass';

import routes from '../src/js/routes';
import BlogContext from '../src/js/BlogContext';

import {
  getPostById
} from './utils/post';

let styles = sass.renderSync({
  file: path.resolve(__dirname, '../src/scss/index.scss'),
  includePaths: [path.resolve(__dirname, '../node_modules')],
  outputStyle: 'compressed'
}).css;

const PORT = process.env.PORT || 8070;

const app = express();
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(compression());
app.use(morgan('tiny'));
app.use(bodyParser.json());

function routerProcessor (req, res, next) {
  if (/\..*$/.test(req.url)) {
    next();
  } else {
    //comment entire match block for single page app
    match({ routes, location: req.url }, (error, redirectLocation, renderProps) => {
      if (error) {
        res.status(500).send(error.message);
      } else if (redirectLocation) {
        res.redirect(302, redirectLocation.pathname + redirectLocation.search);
      } else if (renderProps) {

        function fetchData () {
          let components = renderProps.components.filter(
            (component) => component !== undefined
          );

          let component = (
            components[components.length - 1]
          );

          if (component.fetchData) {
            return (
              component.fetchData(
                renderProps.location,
                renderProps.params,
                `localhost:${PORT}`
              )
            );
          }

          return Promise.resolve();
        }

        fetchData().then((asyncData)=> {

          let asyncDataNode = '';
          if (asyncData) {

            let asyncDataString = JSON.stringify(asyncData);
            asyncDataNode = (
              `<script id="asyncData" type="application/json">${asyncDataString}</script>`
            );
          }

          let component = (
            <BlogContext tag={RouterContext}
              renderProps={renderProps} asyncData={asyncData} />
          );
          let body = renderToString(component);

          let blogMetadata = {
            blogTitle: 'Grommet Blog',
            blogImage: '/img/mobile-app-icon.png',
            blogPage: '',
            blogKeywords: 'react, svg, grommet',
            blogDescription: 'The most advanced open source UX framework for enterprise applications',
            blogDate: new Date()
          };
          if (renderProps.params && renderProps.params.splat) {
            const post = getPostById(renderProps.params.splat);
            blogMetadata.blogTitle = (
              `${post.title} | Grommet Blog`
            );

            const keywords = (post.tags || []).join(' ');

            blogMetadata.blogImage = post.coverImage;
            blogMetadata.blogPage = post.id;
            blogMetadata.blogKeywords = keywords;
            blogMetadata.blogDescription = post.content.split('\n')[0];
            blogMetadata.blogDate = post.createdAt;
          }

          res.render('index.ejs', {
            appBody: body,
            styleContent: styles,
            asyncData: asyncDataNode,
            ...blogMetadata
          });
        }, (err) => {
          res.status(500).send(err);
        });
      } else {
        res.status(404).send('Not found');
      }
    });

    //for single page app use this instead
    //res.sendFile(path.resolve(path.join(__dirname, '/../dist/index.html')));
  }
}

app.use('/api/post', post);
app.use('/', routerProcessor);
app.use('/', express.static(path.join(__dirname, '/../dist')));
app.get('/*', routerProcessor);

const server = http.createServer(app);
server.listen(PORT);

console.log('Server started, listening at: http://localhost:8070...');
