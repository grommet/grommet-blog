// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import LayerForm from 'grommet-templates/components/LayerForm';
import FormField from 'grommet/components/FormField';
import CheckBox from 'grommet/components/CheckBox';
import Button from 'grommet/components/Button';
import TrashIcon from 'grommet/components/icons/base/Trash';

export default class ImageForm extends Component {

  constructor (props) {
    super(props);

    this._onSubmit = this._onSubmit.bind(this);
    this._onToggleCover = this._onToggleCover.bind(this);
    this._onNameChange = this._onNameChange.bind(this);
    this._onFileChange = this._onFileChange.bind(this);

    this.state = {
      image: this.props.image || {},
      errors: {}
    };
  }

  _onSubmit () {
    let errors = {};
    let noErrors = true;
    let file = this.refs.file.files[0];
    if (!file && !this.props.image) {
      errors.file = 'required';
      noErrors = false;
    } else if (file && !/^image.*$/.exec(file.type)) {
      errors.file = 'not an image';
      noErrors = false;
    }

    let currentImage = this.state.image;

    const duplicatedName = this.props.images.some(
      (image, index) => {
        return image.name === currentImage.name &&
          currentImage.id !== index;
      }
    );

    if (duplicatedName) {
      errors.name = 'duplicated';
      noErrors = false;
    }

    if (noErrors) {
      let image = this.state.image;
      if (!/[^\\]*\.(\w+)$/.exec(image.name)) {
        let extension = /[^\\]*\.(\w+)$/.exec(image.file.name)[1];
        image.name = `${image.name}.${extension}`;
      }
      if (this.props.image) {
        this.props.onEdit(image);
      } else {
        this.props.onAdd(image);
      }
    } else {
      this.setState({ errors: errors });
    }
  }

  _onNameChange (event) {
    var image = { ...this.state.image };
    image.name = event.target.value;
    this.setState({ image: image });
  }

  _onFileChange () {
    let file = this.refs.file.files[0];
    let name = this.refs.name.value;
    let image = { ...this.state.image };
    image.file = file;
    if (!name) {
      image.name = file.name;
    }
    this.setState({ image: image });
  }

  _onToggleCover () {
    let image = { ...this.state.image };
    image.cover = !image.cover;
    this.setState({ image: image });
  }

  render () {
    const { image, errors } = this.state;
    let removeControl;
    if (this.props.image) {
      removeControl = (
        <Button plain={true} icon={<TrashIcon />} label="Remove"
          onClick={this.props.onRemove.bind(this, image.id)}
          a11yTitle={`Remove ${image.name} Image`} />
      );
    }

    return (
      <LayerForm title={this.props.heading} submitLabel="OK"
        onClose={this.props.onClose} onSubmit={this._onSubmit}
        secondaryControl={removeControl}>
        <fieldset>
          <FormField htmlFor="name" label="Name" error={errors.name}
            help="If not specified, the file name will be used.">
            <input ref="name" id="name" name="name" type="text"
              value={image.name} onChange={this._onNameChange} />
          </FormField>
          <FormField label="File" htmlFor="file" error={errors.file}>
            <input ref="file" id="file" name="file" type="file"
              onChange={this._onFileChange} />
          </FormField>
          <FormField htmlFor="cover">
            <CheckBox id="cover" name="cover" label="Cover Image?"
              checked={image.cover} onChange={this._onToggleCover} />
          </FormField>
        </fieldset>
      </LayerForm>
    );
  }
}

ImageForm.propTypes = {
  heading: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onRemove: PropTypes.func,
  image: PropTypes.object
};
