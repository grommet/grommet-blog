import React, { PropTypes } from 'react';

import Box from 'grommet/components/Box';
import Notification from 'grommet/components/Notification';

const Error = (props) => {
  return (
    <Box pad='small'>
      <Notification status="critical" message={props.message} />
    </Box>
  );
};

Error.propTypes = {
  message: PropTypes.string.isRequired
};

export default Error;
