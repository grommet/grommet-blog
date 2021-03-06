// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import Blog from './Blog';
import Home from './Home';
import Archive from './components/Archive';
import NotFound from './components/NotFound';
import Post from './components/Post';
import Search from './components/Search';
import Manage from './components/manage/Manage';
import ManageAddPost from './components/manage/ManageAddPost';
import ManageEditPost from './components/manage/ManageEditPost';

export default [
  { path: '/', component: Blog,
    indexRoute: { component: Home },
    childRoutes: [
      {
        path: 'archive', component: Archive,
        childRoutes: [
          { path: 'author/:authorName' },
          { path: 'tag/:tagName' },
          { path: ':year' },
          { path: ':year/:month' },
          { path: ':year/:month/:day' }
        ]
      },
      { path: 'post/*', component: Post },
      { path: 'search', component: Search },
      { path: 'manage', component: Manage },
      { path: 'manage/post/add', component: ManageAddPost },
      { path: 'manage/post/edit/*', component: ManageEditPost },
      { path: '*', component: NotFound }
    ]
  }
];
