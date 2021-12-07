//import './App.css';
import React, { useState, useEffect } from 'react';
import { Sequences } from './Sequences';
import { DateTimeSelector } from './DateTimeSelector';
import { SequenceSelector } from './SequenceSelector';
import { MilestonesList } from './MilestonesList';
import { ShareModal, parseShareURL } from './Share';

import { getTimeZones } from "@vvo/tzdb";

import { DateTime } from "luxon"; 
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const timeZones = getTimeZones();

const theme = createTheme();

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
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}><ContentRoot/></ThemeProvider>
    </StyledEngineProvider>
  );
}

function ContentRoot() {

  const classes = useStyles();

  const [refDate, setRefDate] = useState(null);
  const [refTime, setRefTime] = useState(null);

  const [refTimeZone, setRefTimeZone] = useState(
    timeZones.find(zone => zone.name === localTimeZone));

  const setRefTimeZoneByName = (name) => {
    setRefTimeZone(timeZones.find(zone => zone.name === name));
  };

  const [useTimePrecisionToggle, setUseTimePrecisionToggle] = useState(false);

  const useTimePrecision = useTimePrecisionToggle && refTime != null && refTime.isValid;

  console.log("time/precision: ",refTime, useTimePrecision);

  const [sequenceOptions, setSequenceOption, setSequenceOptions] = useMapState(
    new Map(Sequences.map(s => [s.id, false]))
  );

  const refDateTime = refDate != null && refDate.isValid ?
    useTimePrecision && refTime != null && refTime.isValid ?
      refDate.set({
        hour: refTime.get("hour"),
        minute: refTime.get("minute"),
        second: refTime.get("second")
      }).setZone(refTimeZone.name, { keepLocalTime: true }) :
      refDate :
    null;

  useEffect(() => {
    const url = new URL(window.location.href);
    parseShareURL(url, setRefDate, setRefTime, setRefTimeZoneByName, setUseTimePrecisionToggle, sequenceOptions, setSequenceOptions);
    url.search = "";
    window.history.replaceState(null, '', url);
  }, []); // Run once (since we declare no dependency)

  return (
    <React.StrictMode>
      <Container component="main" maxWidth="xs" className={classes.paper}>
        <CssBaseline />

        {process.env.NODE_ENV === "development" &&
          <p>RefDate:{refDateTime?.toString() ?? "Null"} [{refTimeZone?.name ?? "Null"}]</p>}

        <Instructions />

        <DateTimeSelector {...{ refDate, setRefDate, refTime, setRefTime, refTimeZone, setRefTimeZone, useTimePrecisionToggle, setUseTimePrecisionToggle, localTimeZone, classes }} />

        <SequenceSelector {...{ sequenceOptions, setSequenceOption }} />

        <MilestonesList {...{ refDateTime, useTimePrecision, sequenceOptions, localTimeZone }} />

        <ShareModal {...{ refDateTime, refTimeZone, useTimePrecision, sequenceOptions }} />

        <Footer />
      </Container>
    </React.StrictMode>
  );
}

function Instructions() {
  return (
    <Typography>
      This is the Milestoner.
      <ol>
        <li>Enter a significant date (e.g. your birth)</li>
        <li>Select some number families</li>
        <li>See significant milestones!</li>
      </ol>
      Bonus:
      <ol>
        <li>Store them in your calendar <b>today</b></li>
        <li>Get reminded when they happen <b>in the future</b> :)</li>
      </ol>
    </Typography>
  );
}

function Footer() {
  return (
    <Box mt={8}>
      <Typography variant="body2" color="textSecondary" align="center">
        © 2021 Guillaume Labranche
      </Typography>
      <Donations />
    </Box>);
}

function Donations() {
  return (
    <script type="text/javascript"
      src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js" data-name="bmc-button" data-slug="gumgl"
      data-color="#3f51b5" data-emoji="🍕" data-font="Inter" data-text="Buy me a pizza slice"
      data-outline-color="#ffffff" data-font-color="#ffffff" data-coffee-color="#FFDD00" ></script>
  );
}

function useMapState(initValue) {
  const [map, setMap] = useState(initValue);

  const setValue = (key, value) => {
    setMap(new Map(map.set(key, value)));
  }

  return [map, setValue, setMap];
}