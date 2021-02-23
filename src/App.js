import './App.css';
import React, {useState} from 'react';
import {Generator, Sequences} from './Sequences';
import { Button } from '@material-ui/core';

function App() {
  const [refDate, setRefDate] = useState(new Date(1969, 6, 24));

  const [seqOptions, setSeqOptions] = useState({
    powers10: true,
    n10x: false,
    repdigit: false,
    powers2: false,
    factorial: false,
    lookandsay: false
  });

  const seqInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked :
                  target.value;

    setSeqOptions({
      ...seqOptions,
      [target.name]: value
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
    <div className="App">
      <form>
      <label>
        Date of reference: <br/>
        <input
          name="refDate"
          type="date"
          value={refDate.toISOString().split('T')[0]}
          onChange={refDateInputChange} />
      </label>
      <SequenceOptionsList
        seqOptions={seqOptions}
        seqInputChange={seqInputChange}
        />
    </form>
    <p>Since {refDate.toDateString()}...</p>

    <MilestonesList refDate={refDate} seqOptions={seqOptions} />
    
    </div>
  );
}

function SequenceOptionsList(props) {
  let list = Sequences.map(s => 
    <li key={s.id}>
      <SequenceOption
        sequence={s}
        seqOptions={props.seqOptions}
        seqInputChange={props.seqInputChange}
        />
    </li>);

  return (
    <fieldset>
    <legend>What do you care about?</legend>
    <ul>{list}</ul>
    </fieldset>
  );
}

function SequenceOption(props) {
  const s = props.sequence;
  return (
    <label>
      <input
        name={s.id}
        type="checkbox"
        checked={props.seqOptions[s.id]}
        onChange={props.seqInputChange} />
      {s.name} <a href={"https://oeis.org/" + s.oeis} target="_blank" rel="noreferrer">{s.oeis}</a>
    </label>
  );
}

function MilestonesList(props) {
  let list = computeMilestones(props.refDate, props.seqOptions).map((milestone) =>
    <li key={milestone.date.getTime()+"-"+milestone.value}>
    <span title={milestone.date}>{milestone.date.toISOString().split('T')[0]}</span>: <span title={milestone.value}>{milestone.label}</span> - <a target="_blank" rel="noreferrer" href={"https://www.wolframalpha.com/input/?i="+encodeURIComponent(props.refDate.toISOString().split('T')[0]+" + "+milestone.label)}>Verify</a></li>);
  return <ul>{list}</ul>;
}

function computeMilestones(refDate, seqOptions) {
  const units = [
    {ms: 1000, name: "seconds"},
    {ms: 1000*60, name: "minutes"},
    {ms: 1000*60*60, name: "hours"},
    {ms: 1000*60*60*24, name: "days"},
    {ms: 1000*60*60*24*7, name: "weeks"},
    // months TBD
  ];

  let milestones = [],
      refTime = refDate.getTime(),
      now = Date.now();

  for (const unit of units)
    for (const s of Sequences)
      if (seqOptions[s.id]) {
        let future = Generator.filter((item) => refTime + item.value * unit.ms > now - 1000*60*60*24*365, s.gf);
        let nearFuture = Generator.takeWhile(
          (item) => refTime + item.value * unit.ms < now + 1000*60*60*24*365*10,
          future()
          );
        let tagged = nearFuture.map((item) => ({
          date: new Date(refTime + item.value * unit.ms),
          label: s.format(item) + " " + unit.name,
          value: item.value
        }));
        milestones = milestones.concat(tagged);
      }

  milestones.sort((a,b) => a.date - b.date);

  return milestones;
}

export default App;
