// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';
import LayerForm from 'grommet-templates/components/LayerForm';

const ManageCancelChangePost = (props) => {
  const { post, onCancel, onConfirm } = props;
  return (
    <LayerForm title="Cancel Change" submitLabel="Yes, cancel"
      compact={true} onClose={onCancel} onSubmit={onConfirm}>
      <fieldset>
        <p>Are you sure you want to
          cancel {post.action} <strong>{post.title}</strong> post?</p>
      </fieldset>
    </LayerForm>
  );
};

ManageCancelChangePost.propTypes = {
  post: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default ManageCancelChangePost;
