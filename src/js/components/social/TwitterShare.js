import SocialShare from './SocialShare';
import SocialTwitter from 'grommet/components/icons/base/SocialTwitter';

export default class TwitterShare extends SocialShare {
  constructor (props) {
    super(props);

    this.name = 'Twitter';
    this.icon = (
      SocialTwitter
    );

    const text = encodeURIComponent(props.target);
    this.url = `https://twitter.com/intent/tweet?text=${text}`;
  }
};
