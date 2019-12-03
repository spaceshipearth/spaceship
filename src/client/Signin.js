import _ from 'lodash';
import { Box, Button, IconButton, Typography, TextField, MenuItem } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { FacebookIcon, TwitterIcon } from 'react-share';
import React, { useState } from 'react';
//import styles from './Home.module.css';
import GoogleIconPng from './../../public/google-login-icon.png';
import gql from 'graphql-tag';
import { CloseButton } from './components';
import { useMutation } from 'react-apollo';

const signInMutation = gql`
  mutation signIn($email: String!, $cont: String) {
    signIn(email: $email, cont: $cont)
  }
`;
const signOutMutation = gql`
  mutation signOut {
    signOut
  }
`;

export function SignOutMenuItem() {
  const [signOut, { client }] = useMutation(signOutMutation);

  return (
        <MenuItem
          color="inherit"
          onClick={async () => {
            await signOut();
            await client.resetStore();
            window.location.reload();
          }}
        >
          Sign out
        </MenuItem>
      );
}

export function SigninSignupDialog({ onClose, isSignIn }) {
  const [email, setEmail] = useState();
  const [showMore, setShowMore] = useState(isSignIn);
  const [showSnackbar, setShowSnackbar] = useState();
  const [showDialog, setShowDialog] = useState(true);
  const [signIn, { data }] = useMutation(signInMutation);

  function handleEmailSignup(ev) {
    signIn({variables:{email, cont: window.location.href }});
    setShowSnackbar(true);
    setShowDialog(false);
  }

  return (
    <>
      <Dialog
        open={showDialog}
//        PaperProps={{ className: styles.dialogPaper }}
        maxWidth="md"
        aria-labelledby="signin-dialog-title"
        onClose={onClose}
      >
        <CloseButton onClick={onClose} />
        <DialogTitle id="signin-dialog-title" disableTypography>
          <h1>{isSignIn ? 'Sign in' : 'Sign up'}</h1>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: '16px' }}>
          <Box display="flex" flexDirection="column">
            <SocialLogIn
              network="twitter"
              label="Sign in with Twitter"
              backgroundColor="#1da1f2"
              textColor="#FFFFFF"
              icon={TwitterIcon}
            />
            <SocialLogIn
              network="facebook"
              label="Continue with Facebook"
              backgroundColor="#3b5998"
              textColor="#FFFFFF"
              icon={FacebookIcon}
            />

            {!showMore ? (
              <Button
                variant="text"
                color="secondary"
                onClick={() => {
                  setShowMore(true);
                }}
                style={{ marginBottom: 32 }}
              >
                More options...
              </Button>
            ) : (
              ''
            )}

            {showMore ? (
              <>
                <SocialLogIn
                  network="google"
                  label="Sign in with Google"
                  backgroundColor="#FFFFFF"
                  textColor="#888888"
                  icon={GoogleIcon}
                />
                    <TextField
                      style={{ marginBottom: 32 }}
                      variant="outlined"
                      id="email"
                      label="Email"
                      fullWidth
                      onChange={e => setEmail(e.target.value)}
                      onKeyPress={ev => {
                        if (ev.key === 'Enter') {
                          return handleEmailSignup();
                          ev.preventDefault();
                        }
                      }}
                      InputProps={{
                        type: 'email',
                        endAdornment: (
                          <Button
                            variant="contained"
                            size="large"
                            color="default"
                            onClick={handleEmailSignup}
                            style={{ height: '52px', borderRadius: '3px' }}
                          >
                            Go
                          </Button>
                        ),
                      }}
                    />
              </>
            ) : (
              ''
            )}
            {isSignIn ? (
              ''
            ) : (
              <Box color="text.gray" style={{ maxWidth: 300, margin: '0 auto' }}>
                <Typography variant="caption">
                  By signing up, you agree to the{' '}
                  <a href="/tos.html" target="blank">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy.html" target="blank">
                    Privacy Policy
                  </a>
                  .
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <SignInSnackbar
        open={showSnackbar}
        onSnackbarClose={() => {
          setShowSnackbar(false);
          onClose();
        }}
        message="Please click on the link we've emailed you to sign in!"
      />
    </>
  );
}

export function Signin() {
  return <Signup text="Sign in" hidePrivacyText={true} isSignIn={true} />;
}

export function Signup(props) {
  const [showDialog, setShowDialog] = useState();

  const variant = props.variant || 'contained';
  const color = props.color || 'primary';
  const text = props.text || 'Sign up';
  function handleSignupClick () {
    setShowDialog(true);
  }

  // If props.children is provided we wrap that in a clickable box
  // intead of the [Sign up] button.  This allows eg. the [Join] button
  // to trigger a sign up dialog.
  const signupButton = props.children && !props.isSignedIn ?
        <Box onClick={handleSignupClick}>{props.children}</Box> :
        <Button
          variant={variant}
          color={color}
          onClick={handleSignupClick}
          size={props.size}
          style={props.style}
        >
          {text}
        </Button>
      ;

  return (
    <>
      {signupButton}
      {showDialog ? (
        <SigninSignupDialog
          isSignIn={props.isSignIn}
          onClose={() => {
            setShowDialog(false);
          }}
        />
      ) : null}
    </>
  );
}

function SignInSnackbar({ open, message, onSnackbarClose }) {
  function handleSnackbarClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    onSnackbarClose();
  }

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={open}
      autoHideDuration={10000}
      onClose={handleSnackbarClose}
    >
      <SnackbarContent
        onClose={handleSnackbarClose}
        variant="error"
        aria-describedby="trade-snackbar"
        message={<span id="trade-snackbar">{message}</span>}
        action={[
          <IconButton key="close" aria-label="Close" color="inherit" onClick={handleSnackbarClose}>
            <CloseIcon />
          </IconButton>,
        ]}
      />
    </Snackbar>
  );
}

function GoogleIcon(props) {
  // We helpfully ignore all props
  return (
    <img
      src={GoogleIconPng}
      style={{ width: '18px', height: '18px', padding: '6px', boxSizing: 'unset', marginLeft: '-3px' }}
    />
  );
}

export function SocialLogIn({ network, label, backgroundColor, textColor, icon }) {
  const Icon = icon;
  return (
    <Button
      variant={backgroundColor === '#FFFFFF' ? 'outlined' : 'contained'}
      style={{
        margin: '0 0 12px 0',
        backgroundColor: backgroundColor,
        color: textColor,
        borderRadius: '5px',
        height: 50,
        justifyContent: 'flex-start',
      }}
      onClick={() => {
        window.location = `/auth/connect/${network}?cont=${encodeURIComponent(window.location.href)}`;
      }}
    >
      <span style={{ width: '30px', height: '30px' }}>
        <Icon size={30} logoFillColor={backgroundColor} iconBgStyle={{ fill: 'white' }} />
      </span>
      <span style={{ display: 'inline-block', flex: '1' }}>{label}</span>
    </Button>
  );
}
