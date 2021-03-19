import React from 'react';
import { Generator, Sequences } from './Sequences';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EventIcon from '@material-ui/icons/Event';
import FunctionsIcon from '@material-ui/icons/Functions';

import { DateTime } from "luxon";

export function MilestonesList(props) {

  const computeMilestones = (refDate, sequenceOptions) => {
    const units = ["seconds", "minutes", "hours", "days", "weeks", "months"];
    let milestones = [];

    // Poor man's currying
    const dateFilter = (date, unit, offSetFromNow, isUpperBound) => (item) => {
      const candidate = date.plus({ [unit]: item.value });
      const limit = DateTime.local().plus(offSetFromNow);

      return !isNaN(candidate) &&
        (candidate > limit ^ isUpperBound);
    };

    for (const unit of units)
      for (const s of Sequences)
        if (sequenceOptions[s.id]) {
          let upperBounded = Generator.takeWhile(
            dateFilter(refDate, unit, { years: 10 }, true),
            s.gf());

          let nearFuture = upperBounded.filter(
            dateFilter(refDate, unit, { months: -1 }, false));

          let tagged = nearFuture.map((item) => ({
            date: refDate.plus({ [unit]: item.value }),
            label: s.display(item) + " " + unit,
            explanation: s.explain(item),
            value: item.value
          }));
          milestones = milestones.concat(tagged);
        }

    milestones.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    return milestones;
  }


  return (<List>
    {computeMilestones(props.refDate, props.sequenceOptions).map((milestone) =>
      <Milestone
        key={milestone.date.toMillis() + "-" + milestone.value}
        milestone={milestone}
        refDate={props.refDate}
        useTimePrecision={props.useTimePrecision}
        localTimeZone={props.localTimeZone} />)
    }</List>);
}

function Milestone(props) {
  const milestone = props.milestone;

  return (
    <ListItem>
      <ListItemIcon>
        <EventIcon />
      </ListItemIcon>
      <Tooltip title={milestone.explanation} placement="bottom">
        <ListItemText
          primary={milestone.label}
          secondary={milestone.date.setZone(props.localTimeZone).toLocaleString(
            props.useTimePrecision ? {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: false,
              timeZoneName: 'short'
            } :
              DateTime.DATE_MED)} />
      </Tooltip>
      <ListItemSecondaryAction>
        <Tooltip title="See on Wolfram|Alpha" placement="right">
          <IconButton edge="end" aria-label="info"
            href={`https://www.wolframalpha.com/input/?i=${encodeURIComponent(props.refDate.toString().split('T')[0] + " + " + milestone.label)}`}
            target="_blank">
            <FunctionsIcon />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );
}