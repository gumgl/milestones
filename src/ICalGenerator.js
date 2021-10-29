// As defined in https://tools.ietf.org/html/rfc5545

import React, { useState } from 'react';

import { DateTime } from "luxon";

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

import GetAppIcon from '@mui/icons-material/GetApp';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TitleIcon from '@mui/icons-material/Title';
import EventIcon from '@mui/icons-material/Event';
import SubjectIcon from '@mui/icons-material/Subject';

import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import useMediaQuery from '@mui/material/useMediaQuery';

const useStyles = makeStyles(theme => ({
  eventPreview: {
    minWidth: 275,
    backgroundColor: '#fafafa'
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  subtitleContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
  },
  pos: {
    marginBottom: 12,
  },
  description: {
    whiteSpace: 'pre-line',
  }
}));

export function ICalGenerator(props) {
  
  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  const [titlePattern, setTitlePattern] = useState("Today I am %s old!");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return <>
    <Button
      variant="outlined"
      color="primary"
      onClick={handleClickOpen}
      startIcon={<GetAppIcon />}
      disabled={props.milestones.length === 0}>
      Export to calendar
    </Button>
    <Dialog fullScreen={fullScreen} open={open} onClose={handleClose} scroll="paper">
      <DialogTitle id="responsive-dialog-title">Save milestones to your calendar</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This will download a file containing all {props.milestones.length} milestones previously listed,
          which you can then import into your favorite system (
            <Link href="https://support.google.com/calendar/answer/37118" target="_blank" rel="noreferrer">Google Calendar</Link>, <Link href="https://support.apple.com/en-us/guide/calendar/icl1023/mac" target="_blank" rel="noreferrer">Apple Calendar</Link>, <Link href="https://support.microsoft.com/en-us/office/import-calendars-into-outlook-8e8364e1-400e-4c0f-a573-fe76b5a2d379" target="_blank" rel="noreferrer">Outlook</Link>, etc).<br />
          If you want to include more or less sequences, <Link href="#" onClick={handleClose}>close this menu</Link> and change your selection.
        </DialogContentText>
        <EventPreview classes={classes} refDateTime={props.refDateTime} milestone={props.milestones[0]} useTimePrecision={props.useTimePrecision} titlePattern={titlePattern} />
        <TextField label="Customize Title (%s will be replaced by time span)" value={titlePattern} onChange={(e) => setTitlePattern(e.target.value)} fullWidth />
      </DialogContent>
      <DialogActions>
        <DownloadButton refDateTime={props.refDateTime} milestones={props.milestones} useTimePrecision={props.useTimePrecision} titlePattern={titlePattern} />
        <Button onClick={handleClose} color="primary" autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  </>;
}

function DownloadButton(props) {
  const iCalText = generateCalendar(props.milestones, props.refDateTime, props.useTimePrecision, props.titlePattern);

  const blob = new Blob([iCalText], { type: 'text/plain' });

  const url = window.URL.createObjectURL(blob);

  return <><Button
    variant="contained"
    color="primary"
    size="large"
    startIcon={<GetAppIcon />}
    href={url}
    download="milestones.ics">
    Download ICS File
    </Button>
    {/*<Typography component="pre" variant="body2">{iCalText}</Typography>*/}
  </>
}

function EventPreview(props) {
  const classes = props.classes;
  const milestone = props.milestone;

  return <Card className={classes.eventPreview} variant="outlined">
    <CardContent style={{padding:12}}>
      <Grid container spacing={2}>
        <Grid item xs={6} className={classes.subtitleContainer}>
          <Typography className={classes.title} color="textSecondary" align="left">
            Event Preview
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <CardActions style={{flexDirection:"row-reverse"}}>
            <Button size="small" disabled startIcon={<DeleteIcon />}>Delete</Button>
            <Button size="small" disabled startIcon={<EditIcon />}>Edit</Button>
          </CardActions>
        </Grid>
        <Grid item xs={1}>
          <TitleIcon color="disabled" />
        </Grid>
        <Grid item xs={11}>
          <Typography variant="h5" component="h2">
            {generateEventTitle(milestone, props.titlePattern)}
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <EventIcon color="disabled" />
        </Grid>
        <Grid item xs={11}>
          <Typography>
            {generateReadableDate(milestone.date, props.useTimePrecision)}
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <SubjectIcon color="disabled" />
        </Grid>
        <Grid item xs={11}>
          <Typography variant="body2" className={classes.description}>
            {generateEventDescription(milestone, props.refDateTime, props.useTimePrecision)}
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
}

// https://tools.ietf.org/html/rfc5545#section-3.7 Calendar Properties
function generateCalendar(milestones, refDate, useTimePrecision, titlePattern) {
  const text = `BEGIN:VCALENDAR
PRODID:-//Guillaume Labranche//Custom iCalendar Generator//EN
VERSION:2.0
X-WR-CALNAME:Milestones
X-WR-TIMEZONE:${refDate.zoneName}
${milestones.map(m => generateEvent(m, refDate, useTimePrecision, titlePattern)).join('\n')}
END:VCALENDAR`;
  return text.replaceAll('\n', '\r\n');
}

// https://tools.ietf.org/html/rfc5545#section-3.6.1 Event Component
function generateEvent(milestone, refDate, useTimePrecision, titlePattern) {

  return `BEGIN:VEVENT
UID:${milestone.uid}
URL:https://gumgl.github.io/milestones/
${generateDateComponent("DTSTAMP", DateTime.now(), true, true)}
${generateDateComponent("DTSTART", milestone.date, useTimePrecision, true)}
${generateTextComponent("SUMMARY", generateEventTitle(milestone, titlePattern))}
${generateTextComponent("DESCRIPTION", generateEventDescription(milestone, refDate, useTimePrecision))}
END:VEVENT`;
}

// https://tools.ietf.org/html/rfc5545#section-3.3.5 Date-Time
// https://tools.ietf.org/html/rfc5545#section-3.8.2 Date and Time Component Properties
function generateDateComponent(name, date, useTimePrecision, utc) {
  const iCalDateTimeFormat = "yyyyLLdd'T'HHmmss";
  const iCalDateFormat = "yyyyLLdd";

  if (useTimePrecision) {
    if (utc)
      return `${name.toUpperCase()}:${date.setZone("utc").toFormat(iCalDateTimeFormat)}Z`
    else
      return `${name.toUpperCase()};TZID=${date.zoneName}:${date.toFormat(iCalDateTimeFormat)}`
  } else
    return `${name.toUpperCase()};VALUE=DATE:${date.toFormat(iCalDateFormat)}`
}

// https://tools.ietf.org/html/rfc5545#section-3.1 Content Lines
// https://tools.ietf.org/html/rfc5545#section-3.3.11 Text
function generateTextComponent(name, text) {
  return (name.toUpperCase() + ":" + text)
    .replace(/[,;\\]/g, '\\$&') // Escape commas, semicolons and backslashes
    .replaceAll('\n', '\\n') // Replace newlines with \n
    .match(/(.{1,70})/g) // Split into lines of 70 chars
    .join('\n '); // Merge line strings into a single string separated by newlines

  // What if a line-split happens in the middle of an escape sequence? I manually tested it, not an issue.
}

function generateEventTitle(milestone, pattern) {
  return pattern.replace('%s', milestone.label);
}

function generateEventDescription(milestone, refDate, useTimePrecision) {

  return `On ${generateReadableDate(milestone.date, useTimePrecision)}, exactly ${milestone.label} will have passed `
    + `since ${generateReadableDate(refDate, useTimePrecision)}.`
    + `\n\nThat's ${milestone.explanation}! Doesn't happen often...`
}

function generateReadableDate(date, useTimePrecision) {
  const dateFormat = useTimePrecision ? "DDD 'at' T (ZZZZ)" : "DDDD";
  return date.toFormat(dateFormat);
}