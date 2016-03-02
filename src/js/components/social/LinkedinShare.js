import SocialShare from './SocialShare';
import SocialLinkedin from 'grommet/components/icons/base/SocialLinkedin';

export default class LinkedinShare extends SocialShare {
  constructor (props) {
    super(props);

    this.name = 'Linkedin';
    this.icon = (
      SocialLinkedin
    );

    const url = encodeURIComponent(props.target);
    this.url = `https://www.linkedin.com/shareArticle?url=${url}`;
  }
};
