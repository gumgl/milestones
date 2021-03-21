//import './App.css';
import React, { useState } from 'react';
import { Sequences } from './Sequences';
import { DateTimeSelector } from './DateTimeSelector';
import { SequenceSelector } from './SequenceSelector';
import { MilestonesList } from './MilestonesList';
import { ShareModal } from './Share';

import { DateTime } from "luxon";

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';

const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  root: {
    width: '100%',
    //maxWidth: 560,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function App() {
  const classes = useStyles();

  const [refDate, setRefDate] = useState(DateTime.local(1969, 6, 24));

  const [useTimePrecision, setUseTimePrecision] = useState(false);

  const [sequenceOptions, setSequenceOptions] = useState(
    Object.fromEntries(Object.values(Sequences).map(s => [s.id, false]))
  );

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <DateTimeSelector {...{ refDate, setRefDate, useTimePrecision, setUseTimePrecision, localTimeZone, classes }} />

        <SequenceSelector {...{ sequenceOptions, setSequenceOptions }} />

        <MilestonesList {...{ refDate, useTimePrecision, sequenceOptions, localTimeZone }} />

        <ShareModal {...{ refDate, useTimePrecision, sequenceOptions }} />
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      <Link color="inherit" href="https://github.com/gumgl/milestones">
        Source
      </Link>{' '}
    </Typography>
  );
}