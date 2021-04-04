import React, { useState } from 'react';
import { Sequences } from './Sequences';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';

import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

export function SequenceSelector(props) {

  const mainDisplayList = [
    "powers10",
    "1ton",
    "nto1",
    "repdigit",
    "n10x",
  ];
  const bonusDisplayList = [
    "powers2",
    "factorial",
    "lookandsay",
    "fib",
  ];

  const [proMode, setProMode] = useState(false);

  return (
    <Box>
      <Typography>Pick number families:</Typography>
      <SequenceOptionsList displayOptions={mainDisplayList} moduleProps={props} />

      <Accordion
        expanded={proMode}
        onChange={e => setProMode(!proMode)}
        variant="outlined">

        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Nerd mode</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SequenceOptionsList displayOptions={bonusDisplayList} moduleProps={props} />
        </AccordionDetails>
      </Accordion>
    </Box>);
}

function SequenceOptionsList(props) {
  return <List>
    {props.displayOptions.map(id => {
      console.log(id);
      const sequence = Sequences.find(s => s.id === id);

      return <SequenceOption
        key={sequence.id}
        sequence={sequence}
        moduleProps={props.moduleProps}
      />;
    })}
  </List>;
}

function SequenceOption(props) {
  const s = props.sequence;

  return (
    <ListItem key={s.id}
      onClick={() => props.moduleProps.setSequenceOption(s.id, !props.moduleProps.sequenceOptions.get(s.id))}
      dense button>

      <ListItemIcon>
        <Checkbox
          checked={props.moduleProps.sequenceOptions.get(s.id)}
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