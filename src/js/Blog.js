// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development Company, L.P.

import React from 'react';

import App from 'grommet/components/App';

const Blog = (props) => {
  return (
    <App centered={false}>
      {props.children}
    </App>
  );
};

export default Blog;
