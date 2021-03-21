import React, { useState } from 'react';

import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import ShareIcon from '@material-ui/icons/Share';
import CloseIcon from '@material-ui/icons/Close';

import { useTheme, makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

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

export function ShareModal(props) {
  const theme = useTheme();
  const classes = useStyles();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(false);
  const [shareConfig, setShareConfig] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const showSnackbar = (text) => {
    console.log("Showing snackbar with" + text);
    setSnackbarText(text);
    setSnackbarOpen(true);
  };

  const closeSnackbar = () => {
    setSnackbarOpen(false);
  };

  const shareURL = "https://gumgl.github.io/milestones/";
  const shareText = "Ever wanted to compute all the milestones of your life? Now you can:";

  const copyToClipboard = (text, success, failure) => {
    navigator.clipboard.writeText(text).then(success, failure);
  }

  // TODO: consider not including the text part
  const webShare = async (text, url) => {
    try {
      await navigator.share({...{text, url}});
      showSnackbar("Thanks for sharing!");
    } catch(err) {
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
          Blablabla
        </DialogContentText>
        <TextField
          value={shareURL}
          className={classes.margin}
          autoFocus
          multiline
          rowsMax={2}
          InputProps={{
            readOnly: true,
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
                  onClick={() => {webShare(shareText, shareURL)}}
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