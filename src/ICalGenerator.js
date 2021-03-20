// As defined in https://tools.ietf.org/html/rfc5545

import React, { useState } from 'react';

import { DateTime } from "luxon";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import GetAppIcon from '@material-ui/icons/GetApp';

import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

export function ICalGenerator(props) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
      Save to your calendar
    </Button>
    <Dialog fullScreen={fullScreen} open={open} onClose={handleClose}>
      <DialogTitle id="responsive-dialog-title">Download milestones as ICS File</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This will download a file containing all {props.milestones.length} milestones previously listed.<br/>
          If you want to add or remove sequences, go back and change your selection.
          <DownloadButton refDate={props.refDate} milestones={props.milestones} useTimePrecision={props.useTimePrecision} />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" autoFocus>
          Cancel
        </Button>
        <Button onClick={handleClose} color="secondary" autoFocus>
          Download
        </Button>
      </DialogActions>
    </Dialog>
  </>;
}

function DownloadButton(props) {
  const iCalText = generateCalendar(props.milestones, props.refDate, props.useTimePrecision);

  const blob = new Blob([iCalText], { type: 'text/plain' });

  const url = window.URL.createObjectURL(blob);

  return <><Button
    variant="contained"
    color="primary"
    size="large"
    //className={classes.button}
    startIcon={<GetAppIcon />}
    href={url}
    download="milestones.ics">
    Download ICS File
    </Button>
    <textarea>{iCalText}</textarea>
  </>
}

// https://tools.ietf.org/html/rfc5545#section-3.7 Calendar Properties
function generateCalendar(milestones, refDate, useTimePrecision) {
  const text = `BEGIN:VCALENDAR
PRODID:-//Guillaume Labranche//Custom iCalendar Generator//EN
VERSION:2.0
X-WR-CALNAME:Milestones
X-WR-TIMEZONE:${refDate.zoneName}
${milestones.map(m => generateEvent(m, refDate, useTimePrecision)).join('\n')}
END:VCALENDAR`;
  return text.replaceAll('\n', '\r\n');
}

// https://tools.ietf.org/html/rfc5545#section-3.6.1 Event Component
function generateEvent(milestone, refDate, useTimePrecision) {
  const name = "You";
  const dateFormat = useTimePrecision ? "FFFF" : "DDD";

  const title = `${name} are ${milestone.label} old!`;

  const description = `On ${milestone.date.toFormat(dateFormat)}, exactly ${milestone.label} will have passed `
    + `since ${refDate.toFormat(dateFormat)}.`
    + `\n\nThat's ${milestone.explanation}!`;

  return `BEGIN:VEVENT
UID:${milestone.uid}
URL:https://gumgl.github.io/milestones/
${generateDateComponent("DTSTAMP", DateTime.now(), true, true)}
${generateDateComponent("DTSTART", milestone.date, useTimePrecision, true)}
${generateTextComponent("SUMMARY", title)}
${generateTextComponent("DESCRIPTION", description)}
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
    .replaceAll('\n', '\\n') // Replace newlines with \n
    .replaceAll(',', '\\,') // Escape commas
    .replaceAll(';', '\\;') // Escape semicolons
    .replaceAll('\\', '\\\\;') // Escape backslashes
    .match(/(.{1,70})/g) // Split into lines of 70 chars
    .join("\n "); // Merge line strings into a single string separated by newlines
  
  // What if a line-split happens in the middle of an escape sequence? I manually tested it, not an issue.
}