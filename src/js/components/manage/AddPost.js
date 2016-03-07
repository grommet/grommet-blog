// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

import React, { Component } from 'react';

import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
import Footer from 'grommet/components/Footer';
import Notification from 'grommet/components/Notification';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Layer from 'grommet/components/Layer';

import SpinningIcon from 'grommet/components/icons/Spinning';

export default class AddPost extends Component {
  constructor (props) {
    super(props);

    this._onSubmit = this._onSubmit.bind(this);
    this._onTitleChange = this._onTitleChange.bind(this);
    this._onAuthorChange = this._onAuthorChange.bind(this);
    this._onTagsChange = this._onTagsChange.bind(this);
    this._onContentChange = this._onContentChange.bind(this);

    this.state = {
      errors: {},
      error: props.error
    };
  }

  componentWillReceiveProps (newProps) {
    this.setState({
      error: newProps.error
    });
  }

  _onSubmit (event) {
    event.preventDefault();

    this.setState({
      error: undefined
    });

    let errors = {};
    let noErrors = true;
    let coverImage = this.refs.coverImage.files[0];
    if (!coverImage) {
      errors.coverImage = 'required';
      noErrors = false;
    }
    if (!this.state.title || this.state.title === '') {
      errors.title = 'required';
      noErrors = false;
    }
    if (!this.state.author || this.state.author === '') {
      errors.author = 'required';
      noErrors = false;
    }
    if (!this.state.content || this.state.content === '') {
      errors.content = 'required';
      noErrors = false;
    }
    if (noErrors) {
      this.setState({ adding: true });
      this.props.onSubmit({
        title: this.state.title,
        author: this.state.author,
        content: this.state.content,
        tags: this.state.tags,
        coverImage: coverImage
      });
    } else {
      this.setState({ errors: errors });
    }
  }

  _onTitleChange (event) {
    this.setState({title: event.target.value});
  }

  _onAuthorChange (event) {
    this.setState({author: event.target.value});
  }

  _onTagsChange (event) {
    this.setState({tags: event.target.value});
  }

  _onContentChange (event) {
    this.setState({content: event.target.value});
  }

  render () {
    const { errors, error } = this.state;

    let errorNode;
    if (error) {
      errorNode = (
        <Box pad={{ vertical: 'small' }}>
          <Notification status="critical"
            message={this.state.error} size='small' />
        </Box>
      );
    }

    let buttonNode = (
      <Button label="Add" primary={true}
        onClick={this._onSubmit} type="submit"/>
    );
    if (this.state.adding && !error) {
      buttonNode = (
        <Box direction="row">
          <Box justify="center">
            <SpinningIcon />
          </Box>
          <Box pad={{ horizontal: 'small' }}>
            <span>Adding...</span>
          </Box>
        </Box>
      );
    }

    return (
      <Layer onClose={this.props.onClose} closer={true} align="right"
        a11yTitle={'Add Post'}>
        <Form onSubmit={this._onSubmit}>
          <Header size='large'>
            <Heading tag='h2' strong={true}>Add Post</Heading>
          </Header>
          {errorNode}
          <FormFields>
            <fieldset>
              <FormField label="Title" htmlFor="titleInput"
                error={errors.title}>
                <input id="titleInput" name="title" type="text"
                  ref="titleInput" onChange={this._onTitleChange} />
              </FormField>
              <FormField label="Author" htmlFor="authorInput"
                error={errors.author}>
                <input id="authorInput" name="author" type="text"
                  ref="authorInput" onChange={this._onAuthorChange} />
              </FormField>
              <FormField label="Tags" htmlFor="tagsInput"
                help='comma-separated'>
                <input id="tagsInput" name="tags" type="text"
                  ref="tagsInput" onChange={this._onTagsChange} />
              </FormField>
              <FormField label="Content" htmlFor="contentInput"
                help='markdown format' error={errors.content}>
                <textarea id="contentInput" name="content"
                  ref="contentInput" onChange={this._onContentChange} />
              </FormField>
              <FormField label="Cover Image" htmlFor="coverImage"
                error={errors.coverImage}>
                <input ref="coverImage" id="coverImage"
                  name="coverImage" type="file" />
              </FormField>
            </fieldset>
          </FormFields>
          <Footer pad={{vertical: 'medium'}}>
            {buttonNode}
          </Footer>
        </Form>
      </Layer>
    );
  }
}
