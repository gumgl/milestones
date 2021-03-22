//import './App.css';
import React, { useState, useEffect } from 'react';
import { Sequences } from './Sequences';
import { DateTimeSelector } from './DateTimeSelector';
import { SequenceSelector } from './SequenceSelector';
import { MilestonesList } from './MilestonesList';
import { ShareModal, parseShareURL } from './Share';

import { DateTime } from "luxon";
import { getTimeZones } from "@vvo/tzdb";

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';

const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const timeZones = getTimeZones();

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function App() {

  const classes = useStyles();

  const [refDate, setRefDate] = useState(DateTime.local(1969, 6, 24));

  const [refTimeZone, setRefTimeZone] = useState(
    timeZones.find(zone => zone.name === localTimeZone));

  const setRefTimeZoneByName = (name) => {
    setRefTimeZone(timeZones.find(zone => zone.name === name));
  };

  const [useTimePrecision, setUseTimePrecision] = useState(false);

  const [sequenceOptions, setSequenceOption, setSequenceOptions] = useMapState(
    new Map(Sequences.map(s => [s.id, false]))
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    parseShareURL(url, setRefDate, setRefTimeZoneByName, setUseTimePrecision, sequenceOptions, setSequenceOptions);
    url.search = "";
    window.history.replaceState(null, '', url);
  }, []); // Run once (since we declare no dependency)

  return (
    <React.StrictMode>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <DateTimeSelector {...{ refDate, setRefDate, refTimeZone, setRefTimeZone, useTimePrecision, setUseTimePrecision, localTimeZone, classes }} />

          <SequenceSelector {...{ sequenceOptions, setSequenceOption }} />

          <MilestonesList {...{ refDate, useTimePrecision, sequenceOptions, localTimeZone }} />

          <ShareModal {...{ refDate, refTimeZone, useTimePrecision, sequenceOptions }} />
        </div>
        <Box mt={8}>
          <Copyright />
        </Box>
      </Container>
    </React.StrictMode>
  );
}

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      © 2021 Guillaume Labranche <br />
      <Link color="inherit" href="https://github.com/gumgl/milestones">
        Source
      </Link>
    </Typography>
  );
}

function useMapState(initValue) {
  const [map, setMap] = useState(initValue);

  const setValue = (key, value) => {
    setMap(new Map(map.set(key, value)));
  }

  return [map, setValue, setMap];
}