import React, { useEffect, useRef } from 'react';

import { DateTime } from "luxon";
import { getTimeZones } from "@vvo/tzdb";

import DatePicker from '@mui/lab/DatePicker'
import TimePicker from '@mui/lab/TimePicker'
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateAdapter from '@mui/lab/AdapterLuxon';

import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

const timeZones = getTimeZones();

export function DateTimeSelector(props) {

  const timeInputRef = useRef();
  
  const onRefDateChange = (value) => {
    if (value == null) {
      props.setRefDate(null);
    }
    else if (value.isValid)
      props.setRefDate(value);
  }

  const onRefTimeChange = (value) => {
    if (value != null && value.isValid)
      props.setRefTime(value);
    else
      props.setRefTime(null);
  }

  const onRefTimeZoneChange = (event, value) => {
    if (value != null) {
      props.setRefTimeZone(value);
      //props.setRefDate(props.refDate.setZone(value.name, { keepLocalTime: true }));
    }
  }

  useEffect(() => {
    if (props.useTimePrecisionToggle && timeInputRef.current != null)
      timeInputRef.current.focus();
  },
    [props.useTimePrecisionToggle]);

  return (
    <Box>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <DatePicker
          value={props.refDate}
          onChange={onRefDateChange}
          //inputFormat="D"
          //minDate={DateTime.utc(1900, 1, 1)}
          maxDate={DateTime.now()}
          views={["year", "month", "day"]}
          openTo="year"
          label="Date of birth"
          style={{ backgroundColor: "#FFF" }}
          className={props.classes.input}
          renderInput={(params) => <TextField variant="outlined" {...params} />}
        />
        <Accordion
          expanded={props.useTimePrecisionToggle}
          onChange={(e) => props.setUseTimePrecisionToggle(previousValue => !previousValue)}
          variant="outlined"
          className={props.classes.input}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={props.classes.heading}>Time of day (optional)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box style={{ width: "100%" }}>
              <TimePicker
                value={props.refTime}
                onChange={onRefTimeChange}
                inputFormat="HH:mm"
                minutesStep={5}
                //autoOk
                label="Time of birth (local)"
                //fullWidth
                className={props.classes.input}
                inputRef={timeInputRef}
                renderInput={(params) => <TextField {...params} />}
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

      </LocalizationProvider>
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
    isOptionEqualToValue={(option, value) => option.name == value.name}
    filterOptions={filterOptions}
    noOptionsText="Try entering a larger city"
    disableClearable
    fullWidth
    className={props.classes.input}
    renderInput={(params) => <TextField {...params} label="Birth time zone (search by city)" />}
  />);
}