// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';

import Box from 'grommet/components/Box';
import Layer from 'grommet/components/Layer';

import PostBody from '../PostBody';

const PreviewPost = (props) => {
  const { post, onClose } = props;

  return (
    <Layer onClose={onClose} closer={true}
      a11yTitle='Preview Post' flush={true}>
      <Box full={true} flush={true}>
        <PostBody preview={true} post={post} />
      </Box>
    </Layer>
  );
};

PreviewPost.propTypes = {
  onClose: PropTypes.func.isRequired,
  post: PropTypes.object
};

export default PreviewPost;
