// As defined in https://tools.ietf.org/html/rfc5545

import React, { useState } from 'react';

import { DateTime } from "luxon";

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

import GetAppIcon from '@material-ui/icons/GetApp';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import TitleIcon from '@material-ui/icons/Title';
import EventIcon from '@material-ui/icons/Event';
import SubjectIcon from '@material-ui/icons/Subject';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

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
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
    <Dialog fullScreen={fullScreen} open={open} onClose={handleClose}>
      <DialogTitle id="responsive-dialog-title">Save milestones to your calendar</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This will download a file containing all {props.milestones.length} milestones previously listed,
          which you can then import into your favorite system (
            <Link href="https://support.google.com/calendar/answer/37118" target="_blank" rel="noreferrer">Google Calendar</Link>, <Link href="https://support.apple.com/en-us/guide/calendar/icl1023/mac" target="_blank" rel="noreferrer">Apple Calendar</Link>, <Link href="https://support.microsoft.com/en-us/office/import-calendars-into-outlook-8e8364e1-400e-4c0f-a573-fe76b5a2d379" target="_blank" rel="noreferrer">Outlook</Link>, etc).<br />
          If you want to include more or less sequences, <Link href="#" onClick={handleClose}>close this menu</Link> and change your selection.
        </DialogContentText>
      </DialogContent>
      <DialogContent>
        <EventPreview classes={classes} refDate={props.refDate} milestone={props.milestones[0]} useTimePrecision={props.useTimePrecision} titlePattern={titlePattern} />
      </DialogContent>
      <DialogContent>
        <TextField label="Customize Title (%s will be replaced by time span)" value={titlePattern} onChange={(e) => setTitlePattern(e.target.value)} fullWidth />
      </DialogContent>
      <DialogActions>
        <DownloadButton refDate={props.refDate} milestones={props.milestones} useTimePrecision={props.useTimePrecision} titlePattern={titlePattern} />
        <Button onClick={handleClose} color="primary" autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  </>;
}

function DownloadButton(props) {
  const iCalText = generateCalendar(props.milestones, props.refDate, props.useTimePrecision, props.titlePattern);

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
            {generateEventDescription(milestone, props.refDate, props.useTimePrecision)}
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