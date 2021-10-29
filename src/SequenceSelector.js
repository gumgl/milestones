import React, { useState } from 'react';
import { Sequences } from './Sequences';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';

export function SequenceSelector(props) {

  const mainDisplayList = [
    "powers10",
    "1ton",
    "nto1",
    "repdigit",
    "n10x",
  ];
  const nerdDisplayList = [
    "powers2",
    "factorial",
    "fib",
    "lookandsay",
  ];

  // Enable nerd mode on load if some options are already selected (e.g. load by link)
  const [nerdMode, setNerdMode] = useState(nerdDisplayList.some(id => props.sequenceOptions.get(id)));

  return (
    <Box>
      <Typography>Pick number families:</Typography>
      <SequenceOptionsList displayOptions={mainDisplayList} moduleProps={props} />

      <Accordion
        expanded={nerdMode}
        onChange={e => setNerdMode(previousValue => !previousValue)}
        variant="outlined">

        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Nerd mode</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SequenceOptionsList displayOptions={nerdDisplayList} moduleProps={props} />
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
          <IconButton
            edge="end"
            aria-label="info"
            href={"https://oeis.org/" + s.oeis}
            target="_blank"
            size="large">
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );
}