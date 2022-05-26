import React, { Component } from "react";

import PropTypes from "prop-types";

import validate from "validate.js";

import { withStyles } from "@material-ui/core/styles";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";

import CloseIcon from "@material-ui/icons/Close";

import AuthProviderList from "../AuthProviderList";

import constraints from "../../constraints";
import authentication from "../../services/authentication";
import crypto from "crypto";
import {firestore} from "../../firebase";

const collectionReference = firestore
      .collection("userID");

const counterCollectionReference = firestore.collection("groupControl");

let counter;

const styles = theme => ({
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1)
  },

  icon: {
    marginRight: theme.spacing(0.5)
  },

  divider: {
    margin: "auto"
  },

  grid: {
    marginBottom: theme.spacing(2)
  }
});

const initialState = {
  performingAction: false,
  emailAddress: "",
  emailAddressConfirmation: "",
  password: "",
  passwordConfirmation: "",
  errors: null
};

class SignUpDialog extends Component {
  constructor(props) {
    super(props);
    //Used for automatically assigning people to goal-setting or control groups
    //See code related to signup below for more group assignment details
    counterCollectionReference.doc('counter').get().then( (doc) => {
      if (doc.exists) {
        counter = doc.data()['count'];
        console.log(counter);
      } else {
        console.log("Error getting count");
      }
    });
    this.state = initialState;
  }

  signUp = () => {
    const {
      emailAddress,
      emailAddressConfirmation,
      password,
      passwordConfirmation
    } = this.state;

    const errors = validate(
      {
        emailAddress: emailAddress,
        emailAddressConfirmation: emailAddressConfirmation,
        password: password,
        passwordConfirmation: passwordConfirmation
      },
      {
        emailAddress: constraints.emailAddress,
        emailAddressConfirmation: constraints.emailAddressConfirmation,
        password: constraints.password,
        passwordConfirmation: constraints.passwordConfirmation
      }
    );

    if (errors) {
      this.setState({
        errors: errors
      });
    } else {
      this.setState(
        {
          performingAction: true,
          errors: null
        },
        () => {
          authentication
            .signUpWithEmailAddressAndPassword(emailAddress, password)
            .then(value => {
              let hash = crypto.createHash('sha1').update(emailAddress + password).digest('hex');
              localStorage.setItem('hash', hash);

              collectionReference.doc(hash).set({email: "hidden"});

            })
            .then(value => {
              //Group Assignment
              //If 'count' is even then the person is assigned to the goal-setting group.
              //If 'count' is odd then the person is assigned to the control group.
              //The group wont do anything unless you use it elsewhere.
              //See the commented out code in HomeContent for a group redirect solution.
              let group = "";
              if(counter % 2 === 0) {
                group = "goal-setting";
              }
              else {
                group = "control";
              }

              localStorage.setItem('group', group);
              let hash = localStorage.getItem('hash');
              collectionReference.doc(hash).set({group: group});
              counter = counter +1;
              counterCollectionReference.doc('counter').set({count: counter});

              this.props.dialogProps.onClose();

            })
            .catch(reason => {
              const code = reason.code;
              const message = reason.message;

              switch (code) {
                case "auth/email-already-in-use":
                case "auth/invalid-email":
                case "auth/operation-not-allowed":
                case "auth/weak-password":
                  this.props.openSnackbar(message);
                  return;

                default:
                  this.props.openSnackbar(message);
                  return;
              }
            })
            .finally(() => {
              this.setState({
                performingAction: false
              });
            });
        }
      );
    }
  };

  signInWithAuthProvider = providerId => {
    this.setState(
      {
        performingAction: true
      },
      () => {
        authentication
          .signInWithAuthProvider(providerId)
          .then(user => {
            this.props.dialogProps.onClose(() => {
              const displayName = user.displayName;
              const emailAddress = user.email;

              this.props.openSnackbar(
                `Signed in as ${displayName || emailAddress}`
              );
            });
          })
          .catch(reason => {
            const code = reason.code;
            const message = reason.message;

            switch (code) {
              case "auth/account-exists-with-different-credential":
              case "auth/auth-domain-config-required":
              case "auth/cancelled-popup-request":
              case "auth/operation-not-allowed":
              case "auth/operation-not-supported-in-this-environment":
              case "auth/popup-blocked":
              case "auth/popup-closed-by-user":
              case "auth/unauthorized-domain":
                this.props.openSnackbar(message);
                return;

              default:
                this.props.openSnackbar(message);
                return;
            }
          })
          .finally(() => {
            this.setState({
              performingAction: false
            });
          });
      }
    );
  };

  handleKeyPress = event => {
    const {
      emailAddress,
      emailAddressConfirmation,
      password,
      passwordConfirmation
    } = this.state;

    if (
      !emailAddress ||
      !emailAddressConfirmation ||
      !password ||
      !passwordConfirmation
    ) {
      return;
    }

    const key = event.key;

    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    if (key === "Enter") {
      this.signUp();
    }
  };

  handleExited = () => {
    this.setState(initialState);
  };

  handleEmailAddressChange = event => {
    const emailAddress = event.target.value;

    this.setState({
      emailAddress: emailAddress
    });
  };

  handleEmailAddressConfirmationChange = event => {
    const emailAddressConfirmation = event.target.value;

    this.setState({
      emailAddressConfirmation: emailAddressConfirmation
    });
  };

  handlePasswordChange = event => {
    const password = event.target.value;

    this.setState({
      password: password
    });
  };

  handlePasswordConfirmationChange = event => {
    const passwordConfirmation = event.target.value;

    this.setState({
      passwordConfirmation: passwordConfirmation
    });
  };

  render() {
    // Styling
    const { classes } = this.props;

    // Dialog Properties
    const { dialogProps } = this.props;

    const {
      performingAction,
      emailAddress,
      emailAddressConfirmation,
      password,
      passwordConfirmation,
      errors
    } = this.state;

    return (
      <Dialog
        fullWidth
        maxWidth="sm"
        disableBackdropClick={performingAction}
        disableEscapeKeyDown={performingAction}
        {...dialogProps}
        onKeyPress={this.handleKeyPress}
        onExited={this.handleExited}
      >
        <DialogTitle disableTypography>
          <Typography variant="h6">Sign up for an account</Typography>

          <Tooltip title="Close">
            <IconButton
              className={classes.closeButton}
              disabled={performingAction}
              onClick={dialogProps.onClose}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </DialogTitle>

        <Hidden xsDown>
          <DialogContent>
            <Grid container direction="row">
              <Grid item xs={4}>
                <AuthProviderList
                  performingAction={performingAction}
                  onAuthProviderClick={this.signInWithAuthProvider}
                />
              </Grid>

              <Grid item xs={1}>
                <Divider className={classes.divider} orientation="vertical" />
              </Grid>

              <Grid item xs={7}>
                <Grid container direction="column" spacing={2}>
                  <Grid item xs>
                    <TextField
                      autoComplete="email"
                      disabled={performingAction}
                      error={!!(errors && errors.emailAddress)}
                      fullWidth
                      helperText={
                        errors && errors.emailAddress
                          ? errors.emailAddress[0]
                          : ""
                      }
                      label="E-mail address"
                      placeholder="john@doe.com"
                      required
                      type="email"
                      value={emailAddress}
                      variant="outlined"
                      onChange={this.handleEmailAddressChange}
                    />
                  </Grid>

                  <Grid item xs>
                    <TextField
                      autoComplete="email"
                      disabled={performingAction}
                      error={!!(errors && errors.emailAddressConfirmation)}
                      fullWidth
                      helperText={
                        errors && errors.emailAddressConfirmation
                          ? errors.emailAddressConfirmation[0]
                          : ""
                      }
                      label="E-mail address confirmation"
                      placeholder="john@doe.com"
                      required
                      type="email"
                      value={emailAddressConfirmation}
                      variant="outlined"
                      onChange={this.handleEmailAddressConfirmationChange}
                    />
                  </Grid>

                  <Grid item xs>
                    <TextField
                      autoComplete="new-password"
                      disabled={performingAction}
                      error={!!(errors && errors.password)}
                      fullWidth
                      helperText={
                        errors && errors.password ? errors.password[0] : ""
                      }
                      label="Password"
                      placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                      required
                      type="password"
                      value={password}
                      variant="outlined"
                      onChange={this.handlePasswordChange}
                    />
                  </Grid>

                  <Grid item xs>
                    <TextField
                      autoComplete="password"
                      disabled={performingAction}
                      error={!!(errors && errors.passwordConfirmation)}
                      fullWidth
                      helperText={
                        errors && errors.passwordConfirmation
                          ? errors.passwordConfirmation[0]
                          : ""
                      }
                      label="Password confirmation"
                      placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                      required
                      type="password"
                      value={passwordConfirmation}
                      variant="outlined"
                      onChange={this.handlePasswordConfirmationChange}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
        </Hidden>

        <Hidden smUp>
          <DialogContent>
            <AuthProviderList
              gutterBottom
              performingAction={performingAction}
              onAuthProviderClick={this.signInWithAuthProvider}
            />

            <Grid container direction="column" spacing={2}>
              <Grid item xs>
                <TextField
                  autoComplete="email"
                  disabled={performingAction}
                  error={!!(errors && errors.emailAddress)}
                  fullWidth
                  helperText={
                    errors && errors.emailAddress ? errors.emailAddress[0] : ""
                  }
                  label="E-mail address"
                  placeholder="john@doe.com"
                  required
                  type="email"
                  value={emailAddress}
                  variant="outlined"
                  onChange={this.handleEmailAddressChange}
                />
              </Grid>

              <Grid item xs>
                <TextField
                  autoComplete="email"
                  disabled={performingAction}
                  error={!!(errors && errors.emailAddressConfirmation)}
                  fullWidth
                  helperText={
                    errors && errors.emailAddressConfirmation
                      ? errors.emailAddressConfirmation[0]
                      : ""
                  }
                  label="E-mail address confirmation"
                  placeholder="john@doe.com"
                  required
                  type="email"
                  value={emailAddressConfirmation}
                  variant="outlined"
                  onChange={this.handleEmailAddressConfirmationChange}
                />
              </Grid>

              <Grid item xs>
                <TextField
                  autoComplete="new-password"
                  disabled={performingAction}
                  error={!!(errors && errors.password)}
                  fullWidth
                  helperText={
                    errors && errors.password ? errors.password[0] : ""
                  }
                  label="Password"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  required
                  type="password"
                  value={password}
                  variant="outlined"
                  onChange={this.handlePasswordChange}
                />
              </Grid>

              <Grid item xs>
                <TextField
                  autoComplete="password"
                  disabled={performingAction}
                  error={!!(errors && errors.passwordConfirmation)}
                  fullWidth
                  helperText={
                    errors && errors.passwordConfirmation
                      ? errors.passwordConfirmation[0]
                      : ""
                  }
                  label="Password confirmation"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  required
                  type="password"
                  value={passwordConfirmation}
                  variant="outlined"
                  onChange={this.handlePasswordConfirmationChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
        </Hidden>

        <DialogActions>
          <Button
            color="primary"
            disabled={
              !emailAddress ||
              !emailAddressConfirmation ||
              !password ||
              !passwordConfirmation ||
              performingAction
            }
            variant="contained"
            onClick={this.signUp}
          >
            Sign up
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

SignUpDialog.propTypes = {
  // Styling
  classes: PropTypes.object.isRequired,

  // Dialog Properties
  dialogProps: PropTypes.object.isRequired,

  // Custom Functions
  openSnackbar: PropTypes.func.isRequired
};

export default withStyles(styles)(SignUpDialog);
