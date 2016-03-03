import SocialShare from './SocialShare';
import SocialFacebook from 'grommet/components/icons/base/SocialFacebook';

export default class FacebookShare extends SocialShare {
  constructor (props) {
    super(props);

    this.name = 'Facebook';
    this.icon = (
      SocialFacebook
    );

    const link = encodeURIComponent(props.target);
    const redirectUri = encodeURIComponent('http://facebook.com/');
    this.url = `https://www.facebook.com/dialog/feed?app_id=145634995501895&link=${link}&redirect_uri=${redirectUri}&display=popup`;
  }
};
