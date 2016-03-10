// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

import React, { Component } from 'react';

import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
import Footer from 'grommet/components/Footer';
import Notification from 'grommet/components/Notification';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Section from 'grommet/components/Section';

import SpinningIcon from 'grommet/components/icons/Spinning';

import ManageHeader from './Header';
import BlogFooter from '../Footer';

export default class PostForm extends Component {
  constructor (props) {
    super(props);

    this._onSubmit = this._onSubmit.bind(this);
    this._onTitleChange = this._onTitleChange.bind(this);
    this._onAuthorChange = this._onAuthorChange.bind(this);
    this._onTagsChange = this._onTagsChange.bind(this);
    this._onContentChange = this._onContentChange.bind(this);

    this.state = {
      errors: {},
      error: props.error,
      adding: false
    };

    if (props.post) {
      this.state.post = props.post;
    } else {
      this.state.post = {
        title: undefined,
        author: undefined,
        content: undefined,
        tags: undefined,
        coverImage: undefined
      };
    }
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
    if (!this.state.post.title || this.state.post.title === '') {
      errors.title = 'required';
      noErrors = false;
    }
    if (!this.state.post.author || this.state.post.author === '') {
      errors.author = 'required';
      noErrors = false;
    }
    if (!this.state.post.content || this.state.post.content === '') {
      errors.content = 'required';
      noErrors = false;
    }
    if (noErrors) {
      this.setState({ adding: true });
      let post = {...this.state.post};
      post.coverImage = coverImage;

      this.props.onSubmit(post);
    } else {
      this.setState({ errors: errors });
    }
  }

  _onTitleChange (event) {
    let post = { ...this.state.post };
    post.title = event.target.value;
    this.setState({post: post});
  }

  _onAuthorChange (event) {
    let post = { ...this.state.post };
    post.author = event.target.value;
    this.setState({post: post});
  }

  _onTagsChange (event) {
    let post = { ...this.state.post };
    post.tags = event.target.value;
    this.setState({post: post});
  }

  _onContentChange (event) {
    let post = { ...this.state.post };
    post.content = event.target.value;
    this.setState({post: post});
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
      <Button label={this.props.submitLabel} primary={true}
        onClick={this._onSubmit} type="submit"/>
    );

    if (this.state.adding && !error) {
      buttonNode = (
        <Box direction="row">
          <Box justify="center">
            <SpinningIcon />
          </Box>
          <Box pad={{ horizontal: 'small' }}>
            <span>{this.props.busyMessage}...</span>
          </Box>
        </Box>
      );
    }

    return (
      <Article scrollStep={false}>
        <ManageHeader add={true} />
        <Section pad={{ horizontal: 'large' }}
          primary={true}>
          <Form onSubmit={this._onSubmit}>
            <Header size='large'>
              <Heading tag='h2' strong={true}>
                {this.props.heading}
              </Heading>
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
                  <textarea id="contentInput" name="content" rows="10"
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
        </Section>
        <BlogFooter />
      </Article>
    );
  }
}
