import React from 'react';
import { Sequences } from './Sequences';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import InfoIcon from '@material-ui/icons/Info';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

export function SequenceSelector(props) {

  const list = Sequences.map(s =>
    <SequenceOption
      key={s.id}
      sequence={s}
      sequenceOptions={props.sequenceOptions}
      setSequenceOption={props.setSequenceOption}
    />);

  return (
    <Box>
      <Typography>What do you care about?</Typography>
      <List>{list}</List>
    </Box>);
}

function SequenceOption(props) {
  const s = props.sequence;

  return (
    <ListItem key={s.id}
      onClick={() => props.setSequenceOption(s.id, !props.sequenceOptions.get(s.id))}
      dense button>

      <ListItemIcon>
        <Checkbox
          checked={props.sequenceOptions.get(s.id)}
          name={s.id}
          edge="start"
          tabIndex={-1}
          disableRipple
        />
      </ListItemIcon>
      <ListItemText primary={s.friendlyName} />
      <ListItemSecondaryAction>
        <Tooltip title={s.oeis} placement="right">
          <IconButton edge="end" aria-label="info"
            href={"https://oeis.org/" + s.oeis}
            target="_blank">
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );
}