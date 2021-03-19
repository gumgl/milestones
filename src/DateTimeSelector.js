import React, { useState } from 'react';

import LuxonUtils from '@date-io/luxon';
import { getTimeZones } from "@vvo/tzdb";

import {
  DatePicker,
  TimePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';

import TextField from '@material-ui/core/TextField';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';

const timeZones = getTimeZones();

export function DateTimeSelector(props) {

  const [refTimeZone, setRefTimeZone] = useState(
    timeZones.find(zone => zone.name === props.localTimeZone)
  );

  const onRefDateChange = (value) => {
    props.setRefDate(value.setZone(refTimeZone.name, { keepLocalTime: true }));
  }

  const onRefTimeZoneChange = (event, value) => {
    if (value != null) {
      setRefTimeZone(value);
      props.setRefDate(props.refDate.setZone(value.name, { keepLocalTime: true }));
    }
  }

  return (
    <Box>
      <p>RefDate:{props.refDate.toString()} [{refTimeZone?.name ?? "Null"}]</p>
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <DatePicker
          value={props.refDate}
          onChange={onRefDateChange}
          format="MMM d, y"
          disableFuture
          hideTabs
          autoOk={true}
          minDate={new Date(1910, 1, 1)}
          openTo="year"
          label="Date of birth"
        />
        <Accordion expanded={props.useTimePrecision} onChange={e => props.setUseTimePrecision(!props.useTimePrecision)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className="classes.heading">Time-of-day precision</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TimeZonePicker timeZones={timeZones} value={refTimeZone} onChange={onRefTimeZoneChange} />

            <TimePicker
              value={props.refDate}
              onChange={onRefDateChange}
              format="HH:mm"
              minutesStep={5}
              ampm={false}
              autoOk={true}
              label="Local time of birth"
            />
          </AccordionDetails>
        </Accordion>

      </MuiPickersUtilsProvider>
    </Box>)
}


function TimeZonePicker(props) {
  const filterOptions = createFilterOptions({
    stringify: option => option.rawFormat,
  });
  return (<Autocomplete
    id="timezone"
    value={props.value}
    onChange={props.onChange}
    options={props.timeZones}
    getOptionLabel={(option) => option.name}
    filterOptions={filterOptions}
    style={{ width: 300 }}
    noOptionsText="Try typing a larger city"
    renderInput={(params) => <TextField {...params} label="Birth Time Zone (search by city)" variant="outlined" />}
  />);
}