import React from 'react';
import { Generator, Sequences } from './Sequences';
import { ICalGenerator } from './ICalGenerator';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';

import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import EventIcon from '@mui/icons-material/Event';
import FunctionsIcon from '@mui/icons-material/Functions';

import { DateTime } from "luxon";

export function MilestonesList(props) {

  const computeMilestones = (refDateTime, sequenceOptions) => {
    const units = ["seconds", "minutes", "hours", "days", "weeks", "months"];
    let milestones = [];

    // Poor man's currying
    const dateFilter = (date, unit, offSetFromNow, isUpperBound) => (item) => {
      try {
        const candidate = date.plus({ [unit]: item.value });
        const limit = DateTime.local().plus(offSetFromNow);

        return !isNaN(candidate) &&
          (candidate > limit ^ isUpperBound);
      }
      catch (error) { // Fix until https://github.com/moment/luxon/pull/906 is accepted and published
        if (!error instanceof RangeError)
          throw error;
      }
    };

    for (const unit of units)
      for (const s of Sequences)
        if (sequenceOptions.get(s.id) === true) {
          let upperBounded = Generator.takeWhile(
            dateFilter(refDateTime, unit, { years: 10 }, true),
            s.gf());

          let nearFuture = upperBounded.filter(
            dateFilter(refDateTime, unit, { months: -1 }, false));

          let milestone = nearFuture.map((item) => {
            const date = refDateTime.plus({ [unit]: item.value }).setZone(props.localTimeZone);
            return {
              uid: date.toSeconds() + item.value,
              date: date,
              label: s.display(item) + " " + unit,
              explanation: s.explain(item),
              value: item.value
            }
          });

          milestones = milestones.concat(milestone);
        }

    milestones.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    return milestones;
  }

  const milestones = props.refDateTime != null ?
    computeMilestones(props.refDateTime, props.sequenceOptions) :
    [];

  return <>
    <List>
      {milestones.map((milestone) =>
        <Milestone
          key={milestone.uid}
          milestone={milestone}
          refDateTime={props.refDateTime}
          useTimePrecision={props.useTimePrecision} />)}
    </List>
    <ICalGenerator useTimePrecision={props.useTimePrecision}
      milestones={milestones}
      refDateTime={props.refDateTime} />
  </>;
}

function Milestone(props) {
  const milestone = props.milestone;

  const wolframAlphaURL = "https://www.wolframalpha.com/input/?i=" + encodeURIComponent(
    props.useTimePrecision ?
      props.refDateTime.toFormat("yyyy-LL-dd HH:mm 'UTC'ZZZ") + " + " + milestone.label + " to " + milestone.date.toFormat("ZZZZZ") :
      props.refDateTime.toFormat("yyyy-LL-dd ") + " + " + milestone.label
  );

  return (
    <ListItem>
      <ListItemIcon>
        <EventIcon />
      </ListItemIcon>
      <Tooltip title={milestone.explanation} placement="bottom">
        <ListItemText
          primary={milestone.label}
          secondary={milestone.date.toFormat(props.useTimePrecision ? "DD 'at' T ZZZZ" : "'On' DD")} />
      </Tooltip>
      <ListItemSecondaryAction>
        <Tooltip title="Verify with Wolfram|Alpha" placement="right">
          <IconButton
            edge="end"
            aria-label="info"
            href={wolframAlphaURL}
            target="_blank"
            size="large">
            <FunctionsIcon />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );
}