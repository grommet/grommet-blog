import React from 'react';

import Box from 'grommet/components/Box';
import SpinningIcon from 'grommet/components/icons/Spinning';

const Loading = () => {
  return (
    <Box pad='large' align="center" justify="center">
      <SpinningIcon />
    </Box>
  );
};

export default Loading;
