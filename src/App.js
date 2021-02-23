import './App.css';
import React, {useState} from 'react';
import {Generator, Generators} from './Generators';
import { Button } from '@material-ui/core';

function App() {
  const [refDate, setRefDate] = useState(new Date(1969, 6, 24));

  const [genOptions, setGenOptions] = useState({
    powers10: true,
    n10x: false,
    repdigit: false,
    powers2: false,
    factorial: false,
    lookandsay: false
  });

  const handleGenInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked :
                  target.value;
    const name = target.name;

    setGenOptions({
      ...genOptions,
      [name]: value
    });
  };

  const handleDateInputChange = (e) => {
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
          onChange={handleDateInputChange} />
      </label>
      <SequenceOptionsList
        genOptions={genOptions}
        handleGenInputChange={handleGenInputChange}
        />
    </form>
    <p>Since {refDate.toDateString()}...</p>

    <MilestonesList refDate={refDate} genOptions={genOptions} />
    
    </div>
  );
}

function SequenceOptionsList(props) {
  let list = Generators.map(g => 
    <li key={g.id}>
      <SequenceOption
        generator={g}
        genOptions={props.genOptions}
        handleGenInputChange={props.handleGenInputChange}
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
  const g = props.generator;
  return (
    <label>
      <input
        name={g.id}
        type="checkbox"
        checked={props.genOptions[g.id]}
        onChange={props.handleGenInputChange} />
      {g.name} <a href={"https://oeis.org/" + g.oeis} target="_blank" rel="noreferrer">{g.oeis}</a>
    </label>
  );
}

function MilestonesList(props) {
  let list = computeMilestones(props.refDate, props.genOptions).map((milestone) =>
    <li key={milestone.date.getTime()+"-"+milestone.value}>
    <span title={milestone.date}>{milestone.date.toISOString().split('T')[0]}</span>: <span title={milestone.value}>{milestone.label}</span> - <a target="_blank" rel="noreferrer" href={"https://www.wolframalpha.com/input/?i="+encodeURIComponent(props.refDate.toISOString().split('T')[0]+" + "+milestone.label)}>Verify</a></li>);
  return <ul>{list}</ul>;
}

function computeMilestones(refDate, genOptions) {
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
    for (const g of Generators)
      if (genOptions[g.id]) {
        let future = Generator.filter((item) => refTime + item.value * unit.ms > now - 1000*60*60*24*365, g.gf);
        let nearFuture = Generator.takeWhile(
          (item) => refTime + item.value * unit.ms < now + 1000*60*60*24*365*10,
          future()
          );
        let tagged = nearFuture.map((item) => ({
          date: new Date(refTime + item.value * unit.ms),
          label: g.format(item) + " " + unit.name,
          value: item.value
        }));
        milestones = milestones.concat(tagged);
      }

  milestones.sort((a,b) => a.date - b.date);

  return milestones;
}

export default App;
