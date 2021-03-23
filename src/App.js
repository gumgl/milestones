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

  const [refDate, setRefDate] = useState(DateTime.local(1969, 7, 24));

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
          <Footer />
        </Box>
      </Container>
    </React.StrictMode>
  );
}

function Footer() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      © 2021 Guillaume Labranche <br />
      <script type="text/javascript" src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js" data-name="bmc-button" data-slug="gumgl" data-color="#3f51b5" data-emoji="🍕" data-font="Inter" data-text="Buy me a pizza slice" data-outline-color="#ffffff" data-font-color="#ffffff" data-coffee-color="#FFDD00" ></script>
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