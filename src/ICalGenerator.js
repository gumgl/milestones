// As defined in https://tools.ietf.org/html/rfc5545

import React, { useState } from 'react';

import { DateTime } from "luxon";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

export function ICalGenerator(props) {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const caltext = generateCalendar(props.milestones, props.refDate, props.useTimePrecision);

  return <>
    <Button variant="outlined" color="primary" onClick={handleClickOpen}>
      Export to iCalendar file
    </Button>
    <Dialog fullScreen={fullScreen} open={open} onClose={handleClose}>
      <DialogTitle id="responsive-dialog-title">{"Download milestones as ICS File"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Let Google help apps determine location. This means sending anonymous location data to
          Google, even when no apps are running.
          <textarea>
            {caltext}
          </textarea>
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

function generateEvent(milestone, refDate, useTimePrecision) {
  const name = "You";
  const dateFormat = useTimePrecision ? "FFFF" : "DDD";
  const description = `On ${milestone.date.toFormat(dateFormat)}, exactly ${milestone.label} will have passed `
    + `since ${refDate.toFormat("FFFF")}`
    + `\nThat's ${milestone.explanation}!`;
  // TODO: escape "," and maybe other characters
  return `BEGIN:VEVENT
UID:${milestone.date.toSeconds()}-${milestone.value}
URL:https://gumgl.github.io/milestones/
${generateDateComponent("DTSTAMP", DateTime.now(), true, true)}
${generateDateComponent("DTSTART", milestone.date, useTimePrecision, true)}${/*generateDateComponent("DTEND", milestone.date.plus({ hours: 1 }), false, true)*/}
SUMMARY:${name} are ${milestone.label} old!
${generateDescription(description)}
END:VEVENT`;
}

// https://tools.ietf.org/html/rfc5545#section-3.3.5
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

// https://tools.ietf.org/html/rfc5545#section-3.8.1.5
function generateDescription(desc) {
  return generateMultilineComponent("DESCRIPTION", desc);
}

function generateMultilineComponent(name, text) {
  return (name.toUpperCase() + ":" + text)
    .replaceAll("\n", "\\n") // Replace newlines with \n
    .match(/(.{1,70})/g) // Split into lines of 70 chars
    .join("\n "); // Merge line strings into a single string separated by newlines
}

function download() {
  // (A) CREATE BLOB OBJECT
  var myBlob = new Blob(["Hello World"], { type: 'text/plain' });

  // (B) CREATE DOWNLOAD LINK
  var url = window.URL.createObjectURL(myBlob);
  var anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "HelloWorld.txt";

  // (C) "FORCE DOWNLOAD"
  // NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
  // BETTER TO LET USERS CLICK ON THEIR OWN
  anchor.click();
  window.URL.revokeObjectURL(url);
  document.removeChild(anchor);
}