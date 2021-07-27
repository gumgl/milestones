import React, { useEffect, useRef } from 'react';

import { DateTime } from "luxon";
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

  const onRefDateChange = (date, value) => {
    console.log(value, date);
    if (value == null) {
      props.setRefDate(null);
    }
    else if (date != null && date.isValid)
      props.setRefDate(date);
  }

  const onRefTimeChange = (time, value) => {
    if (value === "")
      props.setRefTime(null);
    else if (time != null && time.isValid)
      props.setRefTime(time);
  }

  const onRefTimeZoneChange = (event, value) => {
    if (value != null) {
      props.setRefTimeZone(value);
      //props.setRefDate(props.refDate.setZone(value.name, { keepLocalTime: true }));
    }
  }

  return (
    <Box>
      {process.env.NODE_ENV === "development" &&
        <p>RefDate:{props.refDate.toString()} [{props.refTimeZone?.name ?? "Null"}]</p>}
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
              <KeyboardTimePicker
                value={props.refTime}
                onChange={onRefTimeChange}
                format="HH:mm"
                minutesStep={5}
                autoOk
                label="Time of birth (local)"
                fullWidth
                className={props.classes.input}
              />
              <TimeZonePicker
                value={props.refTimeZone}
                onChange={onRefTimeZoneChange}
                timeZones={timeZones}
                classes={props.classes}
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
    options={props.timeZones}
    getOptionLabel={(option) => option.name}
    filterOptions={filterOptions}
    noOptionsText="Try entering a larger city"
    fullWidth
    className={props.classes.input}
    renderInput={(params) => <TextField {...params} label="Birth time zone (search by city)" />}
  />);
}