import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Hidden from "@material-ui/core/Hidden";
import { Person } from "@material-ui/icons";
import { firestore } from "../../firebase";

const hash = localStorage.getItem("hash");

let collectionReference;


const styles = theme => ({
  dialogContent: {
    paddingTop: theme.spacing(2)
  },

  badge: {
    top: theme.spacing(2),
    right: -theme.spacing(2)
  },

  loadingBadge: {
    top: "50%",
    right: "50%"
  },

  avatar: {
    marginRight: "auto",
    marginLeft: "auto",

    width: theme.spacing(14),
    height: theme.spacing(14)
  },

  nameInitials: {
    cursor: "default"
  },

  personIcon: {
    fontSize: theme.spacing(7)
  },

  small: {
    width: theme.spacing(4),
    height: theme.spacing(4),

    minHeight: "initial"
  }
});

const initialState = {
  email: "hidden"
};

class AccountTab extends Component {
  email = "hidden";

  constructor(props) {
    super(props);
    this.email = props.user.email;
    if(hash !== "" && hash != undefined) {
      collectionReference = firestore.collection("userID").doc(hash);
      collectionReference.get()
          .then((docSnapshot) => {
            if (docSnapshot.exists) {
              collectionReference.onSnapshot((doc) => {
                let data = doc.data();
                this.setState({email: data.email});
              });
            } else {
              this.enableAnonymity();
            }
          });
    }

    this.state = initialState;
    this.disableAnonymity = this.disableAnonymity.bind(this);
  }
  enableAnonymity(){
    collectionReference.update({email: "hidden"});
    this.setState({email: "hidden"});
  }

  disableAnonymity(){
    collectionReference.update({email: this.email});
    this.setState({email: this.email});
  }

  render() {
    // Styling
    const { classes } = this.props;

    return (
      <DialogContent classes={{ root: classes.dialogContent }}>
        <div style={{ width: "500px" }}>
          <List >
            <ListItem>
              <Hidden xsDown>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
              </Hidden>

              <ListItemText
                primary="Anonymity"
                secondary={this.state.email == "hidden" ? "Currently Anonymous" : "Email Visible"}
              />

              <ListItemSecondaryAction>
                <Button
                  variant="contained"
                  onClick={() => {
                    if(this.state.email == "hidden")
                      this.disableAnonymity();
                    else
                      this.enableAnonymity();
                  }}
                >
                  {this.state.email == "hidden" ? "Disable Anonymity" : "Enable Anonymity"}
              </Button>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </div>
      </DialogContent>
    );
  }
}

AccountTab.propTypes = {
  // Styling
  classes: PropTypes.object.isRequired,

  // Properties
  user: PropTypes.object.isRequired,
  userData: PropTypes.object,

  // Functions
  openSnackbar: PropTypes.func.isRequired,

  // Events
  onDeleteAccountClick: PropTypes.func.isRequired
};

export default withStyles(styles)(AccountTab);
