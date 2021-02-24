//import './App.css';
import React, {useState} from 'react';
import {Generator, Sequences} from './Sequences';

import * as DateFns from 'date-fns'

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import InputLabel from '@material-ui/core/InputLabel';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';

import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import EventIcon from '@material-ui/icons/Event';
import FunctionsIcon from '@material-ui/icons/Functions';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';

export default function App() {
  const classes = useStyles();

  const [refDate, setRefDate] = useState(new Date(1969, 6, 24));

  const [seqOptions, setSeqOptions] = useState(
    Object.fromEntries(Object.values(Sequences).map(s => [s.id, false]))
  );

  const seqInputChange = (id) => () => {
    const value = !seqOptions[id];

    setSeqOptions({
      ...seqOptions,
      [id]: value
    });
  };

  const refDateInputChange = (e) => {
    const d = new Date(e.target.value);

    if (!isNaN(d))
      setRefDate(d);
    else
      console.error("Incorrect date input: ", e.target.value);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormGroup>
          <TextField
            label="Your date of birth"
            type="date"
            value={refDate.toISOString().split('T')[0]}
            className={classes.textField}
            onChange={refDateInputChange}
            InputLabelProps={{
              shrink: true,
            }}
            />

          </FormGroup>
          <FormGroup>
            <FormLabel>What do you care about?</FormLabel>
            <SequenceOptionsList
              classes={classes}
              seqOptions={seqOptions}
              seqInputChange={seqInputChange}
              />
          </FormGroup>
        </FormControl>

        <MilestonesList refDate={refDate} seqOptions={seqOptions} />
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    //marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  formControl: {
    margin: theme.spacing(3),
  },
  root: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: theme.palette.background.paper,
  },
}));

function SequenceOptionsList(props) {
  let list = Sequences.map(s =>
    <SequenceOption
      key={s.id}
      sequence={s}
      seqOptions={props.seqOptions}
      seqInputChange={props.seqInputChange}
      />);

  return (
    <List className={props.classes.root} role={undefined}>{list}</List>
  );
}

function SequenceOption(props) {
  const s = props.sequence;
  const labelId = `checkbox-list-label-${s.id}`;
  
  return (
    <ListItem key={s.id}
      onClick={props.seqInputChange(s.id)}
      dense button>

      <ListItemIcon>
        <Checkbox
          checked={props.seqOptions[s.id]}
          name={s.id}
          edge="start"
          tabIndex={-1}
          disableRipple
          //inputProps={{ 'aria-labelledby': labelId }}
        />
      </ListItemIcon>
      <ListItemText /*id={labelId}*/ primary={s.name} />
      <ListItemSecondaryAction>
        <Tooltip title={s.oeis} placement="right">
          <IconButton edge="end" aria-label="info"
            href={"https://oeis.org/" + s.oeis}
            target="_blank">
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );
}

function MilestonesList(props) {
  return (<List>
  {computeMilestones(props.refDate, props.seqOptions).map((milestone) =>
    <Milestone
      key={milestone.date.getTime()+"-"+milestone.value}
      refDate={props.refDate}
      milestone={milestone} />)
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
        <ListItemText primary={milestone.label} secondary={milestone.date.toDateString()} />
      </Tooltip>
      <ListItemSecondaryAction>
        <Tooltip title="See on Wolfram|Alpha" placement="right">
          <IconButton edge="end" aria-label="info"
            href={`https://www.wolframalpha.com/input/?i=${encodeURIComponent(props.refDate.toISOString().split('T')[0]+" + "+milestone.label)}`}
            target="_blank">
            <FunctionsIcon />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
    );
}

function computeMilestones(refDate, seqOptions) {
  const units = ["seconds", "minutes", "hours", "days", "weeks", "months"];

  let milestones = [],
      refTime = refDate.getTime(),
      now = Date.now();

  for (const unit of units)
    for (const s of Sequences)
      if (seqOptions[s.id]) {
        let future = Generator.filter(
          (item) => DateFns.add(refDate, {[unit]:item.value}) > DateFns.sub(now, {years:1}),
          s.gf);
        let nearFuture = Generator.takeWhile(
          (item) => DateFns.add(refDate, {[unit]:item.value}) < DateFns.add(now, {years:10}),
          future()
          );
        let tagged = nearFuture.map((item) => ({
          date: DateFns.add(refDate, {[unit]:item.value}),
          label: s.display(item) + " " + unit,
          explanation: s.explain(item),
          value: item.value
        }));
        milestones = milestones.concat(tagged);
      }

  milestones.sort((a,b) => a.date - b.date);

  return milestones;
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