// third-party
import { merge } from 'lodash';

// project import

import IconButton from './IconButton';

import LinearProgress from './LinearProgress';

import OutlinedInput from './OutlinedInput';


// ==============================|| OVERRIDES - MAIN ||============================== //

export default function ComponentsOverrides(theme) {
  return merge(
 
    IconButton(theme),

    LinearProgress(),

    OutlinedInput(theme),
  );
}
