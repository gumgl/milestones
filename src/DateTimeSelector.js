import React, { useState } from 'react';

import LuxonUtils from '@date-io/luxon';
import { getTimeZones } from "@vvo/tzdb";

import {
  KeyboardDatePicker,
  KeyboardTimePicker,
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
    timeZones.find(zone => zone.name === props.localTimeZone));

  const onRefDateChange = (date, value) => {
    if (date != null && date.isValid)
      props.setRefDate(date.setZone(refTimeZone.name, { keepLocalTime: true }));
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
        <KeyboardDatePicker
          value={props.refDate}
          onChange={onRefDateChange}
          format="yyyy-MM-dd"
          disableFuture
          hideTabs
          autoOk
          minDate={new Date(1910, 1, 1)}
          maxDate={new Date(2009, 11, 31)}
          openTo="year"
          label="Date of birth"
          inputVariant="outlined"
          fullWidth
          style={{ backgroundColor: "#FFF" }}
          className={props.classes.input}
        />
        <Accordion
          expanded={props.useTimePrecision}
          onChange={e => props.setUseTimePrecision(!props.useTimePrecision)}
          variant="outlined"
          className={props.classes.input}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={props.classes.heading}>Time-of-day precision</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box style={{ width: "100%" }}>
              <TimeZonePicker value={refTimeZone} onChange={onRefTimeZoneChange} classes={props.classes} />
              <KeyboardTimePicker
                value={props.refDate}
                onChange={onRefDateChange}
                format="HH:mm"
                minutesStep={5}
                autoOk
                label="Time of birth (local)"
                fullWidth
                className={props.classes.input}
              />
            </Box>
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
    options={timeZones}
    getOptionLabel={(option) => option.name}
    filterOptions={filterOptions}
    noOptionsText="Try entering a larger city"
    fullWidth
    className={props.classes.input}
    renderInput={(params) => <TextField {...params} label="Birth time zone (search by city)" />}
  />);
}