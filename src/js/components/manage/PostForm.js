// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

import React, { Component } from 'react';

import Anchor from 'grommet/components/Anchor';
import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
import Footer from 'grommet/components/Footer';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';
import Notification from 'grommet/components/Notification';
import Section from 'grommet/components/Section';

import AddIcon from 'grommet/components/icons/base/Add';
import EditIcon from 'grommet/components/icons/base/Edit';
import SpinningIcon from 'grommet/components/icons/Spinning';
import CloseIcon from 'grommet/components/icons/base/Close';

import PreviewPost from './PreviewPost';
import ImageForm from './ImageForm';

import { setDocumentTitle, getImageAsBase64 } from '../../utils/blog';

import history from '../../RouteHistory';

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function getContentImages (previewContent) {
  const regex = /!\[(.*?)\]\((?!http)(.*?)\)/g;
  let content = previewContent;
  let matchingGroup;

  let images = [];
  do {
    matchingGroup = regex.exec(content);
    if (matchingGroup) {
      images.push(matchingGroup[2]);
    }
  } while (matchingGroup);

  return images;
}

export default class PostForm extends Component {
  constructor (props) {
    super(props);

    this._onSubmit = this._onSubmit.bind(this);
    this._onTitleChange = this._onTitleChange.bind(this);
    this._onAuthorChange = this._onAuthorChange.bind(this);
    this._onTagsChange = this._onTagsChange.bind(this);
    this._onContentChange = this._onContentChange.bind(this);
    this._renderImagesForm = this._renderImagesForm.bind(this);
    this._renderImageLayer = this._renderImageLayer.bind(this);
    this._renderPreviewLayer = this._renderPreviewLayer.bind(this);
    this._onRequestToAddImage = this._onRequestToAddImage.bind(this);
    this._onRequestToEditImage = this._onRequestToEditImage.bind(this);
    this._onImageAdd = this._onImageAdd.bind(this);
    this._onImageEdit = this._onImageEdit.bind(this);
    this._onImageRemove = this._onImageRemove.bind(this);
    this._onImageClose = this._onImageClose.bind(this);
    this._onPostPreview = this._onPostPreview.bind(this);
    this._onPreviewClose = this._onPreviewClose.bind(this);
    this._updateCoverImage = this._updateCoverImage.bind(this);

    this.state = {
      errors: {},
      error: props.error,
      adding: false
    };

    if (props.post) {
      this.state.post = props.post;
      if (!this.state.post.images) {
        this.state.post.images = [];
      }

      const replaceValue = '![$1]($2)';
      this.state.post.content = (
        this.state.post.content.replace(/!\[(.*?)\]\((?!http).*?images\/(.*?)\)/g, replaceValue)
      );
    } else {
      this.state.post = {
        title: undefined,
        author: undefined,
        content: undefined,
        tags: undefined,
        images: [],
        previewPost: undefined
      };
    }
  }

  componentDidMount () {
    setDocumentTitle(this.props.heading);
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

      this.props.onSubmit(this.state.post);
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

  _onRequestToAddImage () {
    this.setState({imageLayer: true, image: undefined});
  }

  _onRequestToEditImage (index) {
    this.setState({
      imageLayer: true,
      image: this.state.post.images[index]
    });
  }

  _onImageClose () {
    this.setState({imageLayer: false});
  }

  _updateCoverImage (image) {
    getImageAsBase64(image).then((imageAsBase64) => {
      const post = {...this.state.post};
      post.coverImage = imageAsBase64;
      this.setState({post: post});
    });
  }

  _onImageEdit (image) {
    let post = {...this.state.post};

    if (image.cover) {
      this._updateCoverImage(image);
      post.images.forEach((image) => image.cover = undefined);
    }

    post.images[image.id] = image;
    this.setState({post: post, imageLayer: false});
  }

  _onImageAdd (image) {
    const post = {...this.state.post};
    image.id = post.images.length;

    if (image.cover) {
      this._updateCoverImage(image);
      post.images.forEach((image) => image.cover = undefined);
    }

    post.images.push(image);
    this.setState({post: post, imageLayer: false});
  }

  _onImageRemove (index) {
    const post = {...this.state.post};
    post.images.splice(index, 1);
    this.setState({post: post, imageLayer: false});
  }

  _onPostPreview (event) {
    event.preventDefault();

    const previewPost = {...this.state.post};

    if (previewPost.content && previewPost.images.length > 0) {
      let images = getContentImages(previewPost.content);
      previewPost.images.forEach((image, index) => {
        const indexOfImage = images.indexOf(image.name);
        const imageRegex = (
          new RegExp(`!\\[(.*?)\\]\\((?!http)(${escapeRegExp(image.name)})\\)`, 'g')
        );
        if (indexOfImage !== -1 && image.file) {
          getImageAsBase64(image).then((imageAsBase64) => {
            const replaceValue = `![$1](${imageAsBase64})`;
            previewPost.content = previewPost.content.replace(
              imageRegex, replaceValue
            );

            if (index === previewPost.images.length - 1) {
              this.setState({previewPost: previewPost});
            }
          });
        } else {
          if (this.props.post) {
            // on edit we need to replace image path back to existing updated img
            const replaceValue = (
              `![$1](${this.props.post.imagePath}/${image.name})`
            );
            previewPost.content = previewPost.content.replace(
              imageRegex, replaceValue
            );
          }
          if (index === previewPost.images.length - 1) {
            this.setState({previewPost: previewPost});
          }
        }
      }, this);
    } else {
      this.setState({previewPost: previewPost});
    }
  }

  _onPreviewClose () {
    this.setState({previewPost: undefined});
  }

  _onClosePost () {
    history.push('/manage');
  }

  _renderImagesForm () {
    const images = this.state.post.images.map((image, index) => {
      let secondary;
      if (image.cover) {
        secondary = <span className="secondary"> (cover)</span>;
      }
      return (
        <ListItem key={index} justify="between" pad="none"
          separator={index === 0 ? 'horizontal' : 'bottom'}
          responsive={false}>
          <span>
            {image.name}
            {secondary}
          </span>
          <Button icon={<EditIcon />} a11yTitle={`Edit ${image.name} Image`}
            onClick={this._onRequestToEditImage.bind(this, index)} />
        </ListItem>
      );
    });

    return (
      <fieldset>
        <Header size="small" justify="between">
          <h3>Images</h3>
          <Button icon={<AddIcon />} onClick={this._onRequestToAddImage}
            a11yTitle='Add Image' />
        </Header>
        <List>
          {images}
        </List>
      </fieldset>
    );
  }

  _renderImageLayer () {
    let heading = 'Add Image';
    if (this.state.image) {
      heading = 'Edit Image';
    }
    return (
      <ImageForm heading={heading} image={this.state.image}
        onEdit={this._onImageEdit} onAdd={this._onImageAdd}
        onRemove={this._onImageRemove} onClose={this._onImageClose}
        images={this.state.post.images} />
    );
  }

  _renderPreviewLayer () {
    return (
      <PreviewPost post={this.state.previewPost}
        onClose={this._onPreviewClose} />
    );
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
        <Box direction="row" responsive={false}>
          <Box justify="center">
            <SpinningIcon />
          </Box>
          <Box pad={{ horizontal: 'small' }}>
            <span>{this.props.busyMessage}...</span>
          </Box>
        </Box>
      );
    }

    let imageLayer;
    if (this.state.imageLayer) {
      imageLayer = this._renderImageLayer();
    }

    let previewLayer;
    if (this.state.previewPost) {
      previewLayer = this._renderPreviewLayer();
    }

    return (
      <Article scrollStep={false}>
        <Section pad={{ horizontal: 'large' }}
          primary={true}>
          <Form onSubmit={this._onSubmit}>
            <Box responsive={false} direction="row" justify='between'>
              <Header>
                <Heading tag='h2' strong={true}>
                  {this.props.heading}
                </Heading>
              </Header>
              <Box direction="row" responsive={false}>
                <Button icon={<CloseIcon />} onClick={this._onClosePost}
                  a11yTitle='Close Post' />
              </Box>
            </Box>
            {errorNode}
            <FormFields>
              <fieldset>
                <FormField label="Title" htmlFor="titleInput"
                  error={errors.title}>
                  <input id="titleInput" name="title" type="text"
                    ref="titleInput" value={this.state.post.title}
                    onChange={this._onTitleChange} />
                </FormField>
                <FormField label="Author" htmlFor="authorInput"
                  error={errors.author}>
                  <input id="authorInput" name="author" type="text"
                    ref="authorInput" value={this.state.post.author}
                    onChange={this._onAuthorChange} />
                </FormField>
                <FormField label="Tags" htmlFor="tagsInput"
                  help='comma-separated'>
                  <input id="tagsInput" name="tags" type="text"
                    ref="tagsInput" value={this.state.post.tags}
                    onChange={this._onTagsChange} />
                </FormField>
                <FormField label="Content" htmlFor="contentInput"
                  help='markdown format' error={errors.content}>
                  <textarea id="contentInput" name="content" rows="10"
                    ref="contentInput" value={this.state.post.content}
                    onChange={this._onContentChange} />
                </FormField>
              </fieldset>
              {this._renderImagesForm()}
            </FormFields>
            <Footer pad={{vertical: 'medium'}}>
              {buttonNode}
              <Box pad={{horizontal: 'small'}}>
                <Anchor href="#" onClick={this._onPostPreview}>Preview</Anchor>
              </Box>
            </Footer>
          </Form>
        </Section>
        {imageLayer}
        {previewLayer}
      </Article>
    );
  }
}
