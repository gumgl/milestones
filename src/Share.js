import React, { useState, useEffect, useRef } from 'react';

import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import ShareIcon from '@material-ui/icons/Share';

import { useTheme, makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { DateTime } from 'luxon';

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

const [shortDateOnlyFormat, shortDatetimeFormat] = ["yyyyLLdd", "yyyyLLdd'T'HHmm"];

export function ShareModal(props) {

  const theme = useTheme();
  const classes = useStyles();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(false);
  const [shareConfig, setShareConfig] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");

  const shareText = shareConfig ? `See the milestones of my life starting on ${props.refDate.toFormat("D")}!`
    : "See the cool milestones of your life:";
  const shareURL = generateShareURL(props, shareConfig);
  const shareURLInputRef = useRef();

  // Whenever the share URL changes, select it
  useEffect(() => {
    if (shareURLInputRef.current != null) {
      shareURLInputRef.current.focus();
      shareURLInputRef.current.select();
    }
  }, [shareURL]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const showSnackbar = (text) => {
    setSnackbarText(text);
    setSnackbarOpen(true);
  };

  const closeSnackbar = () => {
    setSnackbarOpen(false);
  };

  const copyToClipboard = (text, success, failure) => {
    navigator.clipboard.writeText(text).then(success, failure);
  }

  // TODO: consider not including the text part
  const webShare = async (text, url) => {
    try {
      await navigator.share({ ...{ text, url } });
      showSnackbar("Thanks for sharing!");
    } catch (err) {
      //showSnackbar(":(");
    }
  }

  return <>
    <Button
      variant="outlined"
      color="primary"
      onClick={handleClickOpen}
      startIcon={<ShareIcon />}>
      Share
    </Button>
    <Dialog fullScreen={fullScreen} open={open} onClose={handleClose}>
      <DialogTitle id="responsive-dialog-title">
        Share
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {shareText}
        </DialogContentText>
        <TextField
          value={shareURL}
          inputRef={shareURLInputRef}
          className={classes.margin}
          autoFocus
          multiline
          rowsMax={2}
          InputProps={{
            onFocus: (event) => {
              event.preventDefault();
              const { target } = event;
              target.focus();
              target.select();
            },
            fontSize: "small",
            endAdornment: (
              <InputAdornment position="end">
                <Button color="primary"
                  onClick={() => {
                    copyToClipboard(shareURL,
                      () => showSnackbar("URL copied"),
                      () => showSnackbar("URL failed to copy"))
                  }}
                >Copy</Button>
                <Button color="primary"
                  onClick={() => { webShare(shareText, shareURL) }}
                >Share</Button>
              </InputAdornment>
            )
          }}
        />
      </DialogContent>
      <DialogActions>
        <FormControlLabel
          control={<Checkbox checked={shareConfig} onChange={() => setShareConfig(!shareConfig)} />}
          label="Share config"
        />
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={3000}
        open={snackbarOpen}
        onClose={closeSnackbar}
        message={snackbarText}
      />
    </Dialog>
  </>
}

export function generateShareURL(props, shareConfig) {
  const url = new URL(window.location.href);

  if (shareConfig) {
    url.searchParams.set("d", props.refDate.toFormat(props.useTimePrecision ? shortDatetimeFormat : shortDateOnlyFormat));
    if (props.useTimePrecision)
      url.searchParams.set("z", props.refTimeZone.name);
    url.searchParams.set("o", boolArrayToHex(Array.from(props.sequenceOptions.values())));
  }
  return url;
}

export function parseShareURL(url, setRefDate, setRefTimeZoneByName, setTimePrecision, sequenceOptions, setSequenceOptions) {
  if (url.searchParams.has("d")) {
    const useTimePrecision = url.searchParams.get("d").length !== shortDateOnlyFormat.length;
    const date = DateTime.fromFormat(url.searchParams.get("d"), useTimePrecision ? shortDatetimeFormat : shortDateOnlyFormat);
    if (date.isValid) {
      setTimePrecision(useTimePrecision);
      if (useTimePrecision && url.searchParams.has("z")) {
        const timeZone = url.searchParams.get("z");
        setRefTimeZoneByName(timeZone);
        setRefDate(date.setZone(timeZone, { keepLocalTime: true }));
      } else {
        setRefDate(date);
      }
    }
  }
  if (url.searchParams.has("o")) {
    const hex = url.searchParams.get("o");
    if (parseInt(hex, 16).toString(16) === hex)
      setSequenceOptions(setMapValues(sequenceOptions, hexToBoolArray(hex, sequenceOptions.length, false)));
  }
}

/* This function takes an array of booleans (e.g. option selection)
   and returns a hex string representing it.
   Note that larger arrays map onto smaller ones preserving the values
   at the correct positions. */
function boolArrayToHex(arr) {
  const binaryString = arr.reverse().map(i => (+i).toString()).join("");
  return parseInt(binaryString, 2).toString(16);
}

function hexToBoolArray(hex, requiredLength = -1, paddingValue = false) {
  const binaryString = parseInt(hex, 16).toString(2);
  const arr = binaryString.split('').map(i => i === "1" ? true : false).reverse();

  return requiredLength === -1 || arr.length === requiredLength ? arr :
    arr.length < requiredLength ? arr.concat(Array(requiredLength - arr.length).fill(paddingValue)) :
      arr.slice(0, requiredLength - 1);
}

function setMapValues(map, values) {
  const newMap = new Map();
  const [mapIter, valIter] = [map.keys(), values[Symbol.iterator]()];

  let [key, value] = [mapIter.next(), valIter.next()];

  while (!key.done && !value.done) {
    newMap.set(key.value, value.value);
    [key, value] = [mapIter.next(), valIter.next()]
  }
  return newMap;
}