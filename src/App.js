import './App.css';
import React from 'react';
import {Generator, Generators} from './Generators';
import { Button } from '@material-ui/core';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      refDate: new Date(1969, 6, 24),
      powers10: true,
      n10x: false,
      repdigit: false,
      powers2: false,
      factorial: false,
      lookandsay: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : 
                  target.type === 'date' ? new Date(target.value) :
                  target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }
  
  render() {
    return (
      <div className="App">
        <form>
        <label>
          Date of reference: <br/>
          <input
            name="refDate"
            type="date"
            value={this.state.refDate.toISOString().split('T')[0]}
            onChange={this.handleInputChange} />
        </label>
        <fieldset>
        <legend>What do you care about?</legend>
        <ul>
          <li>
            <label>
              <input
                name="powers10"
                type="checkbox"
                checked={this.state.powers10}
                onChange={this.handleInputChange} />
              10^x
          </label>
          </li>
          <li>
            <label>
              <input
                name="n10x"
                type="checkbox"
                checked={this.state.n10x}
                onChange={this.handleInputChange} />
              n * 10^x (for small n)
            </label>
          </li>
          <li>
            <label>
              <input
                name="repdigit"
                type="checkbox"
                checked={this.state.repdigit}
                onChange={this.handleInputChange} />
              [n]^x (repeated digit)
            </label>
          </li>
          <li>
            <label>
              <input
                name="powers2"
                type="checkbox"
                checked={this.state.powers2}
                onChange={this.handleInputChange} />
              2^x
            </label>
          </li>
          <li>
            <label>
              <input
                name="factorial"
                type="checkbox"
                checked={this.state.factorial}
                onChange={this.handleInputChange} />
              x! (factorial)
            </label>
          </li>
          <li>
            <label>
              <input
                name="lookandsay"
                type="checkbox"
                checked={this.state.lookandsay}
                onChange={this.handleInputChange} />
              Look-and-say terms (<a href="https://oeis.org/A005150" target="_blank" rel="noreferrer">A005150</a>)
            </label>
          </li>
        </ul>
        </fieldset>
      </form>
      <p>Since {this.state.refDate.toDateString()}...</p>

      <MilestonesList state={this.state} />
      
      </div>
    );
  }
}

function MilestonesList(props) {
  let list = computeMilestones(props.state).map((milestone) =>
    <li key={milestone.date.getTime()+"-"+milestone.value}>
    <span title={milestone.date}>{milestone.date.toISOString().split('T')[0]}</span>: <span title={milestone.value}>{milestone.label}</span> - <a target="_blank" rel="noreferrer" href={"https://www.wolframalpha.com/input/?i="+encodeURIComponent(props.state.refDate.toISOString().split('T')[0]+" + "+milestone.label)}>Verify</a></li>);
  return <ul>{list}</ul>;
}

function computeMilestones(state) {
  const units = [
    {ms: 1000, name: "seconds"},
    {ms: 1000*60, name: "minutes"},
    {ms: 1000*60*60, name: "hours"},
    {ms: 1000*60*60*24, name: "days"},
    {ms: 1000*60*60*24*7, name: "weeks"},
    // months TBD
  ];

  let milestones = [],
      refTime = state.refDate.getTime(),
      now = Date.now();

  for (const unit of units)
    for (const g of Generators)
      if (state[g.name]) {
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
