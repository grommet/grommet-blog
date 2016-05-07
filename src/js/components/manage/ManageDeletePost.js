// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';
import Paragraph from 'grommet/components/Paragraph';
import LayerForm from 'grommet-templates/components/LayerForm';

const ManageDeletePost = (props) => {
  const { post, onCancel, onDelete } = props;
  return (
    <LayerForm title="Remove" submitLabel="Yes, remove"
      compact={true} onClose={onCancel} onSubmit={onDelete}>
      <fieldset>
        <Paragraph>Are you sure you want to
          remove <strong>{post.title}</strong> post?</Paragraph>
      </fieldset>
    </LayerForm>
  );
};

ManageDeletePost.propTypes = {
  post: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default ManageDeletePost;
