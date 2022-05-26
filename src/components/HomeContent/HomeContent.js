import React, {Component} from "react";
import PropTypes from "prop-types";
import {withRouter} from "react-router-dom";
import {auth, firestore} from "../../firebase";
import authentication from "../../services/authentication";
import EmptyState from "../EmptyState";
import Box from "@material-ui/core/Box";
import QuizCard from "../QuizCard/QuizCard";

class HomeContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            quizList: []
        };
    }

    //fetchGroup can be used for a goal-setting study redirect provided that the participants are assigned to a group.
    //New sign-ups are assigned to a group in SignUpDialog.js
    //Change the URLs/Routes below to redirect to the correct quizzes
    fetchGroup = () => {
        let group;
        let ref;
    
        ref = firestore.collection("userID").doc(localStorage.getItem('hash')).get().then( (doc) => {
          if (doc.exists) {
            group = doc.data()['group'];
            if(group == "goal-setting") {
                //CHANGE THIS ROUTE IF YOU WANT THE REDIRECT TO WORK!!!
                this.props.history.push("/blockGroup/Goal-Setting-2022");
            }
            else if (group == "control"){
                //CHANGE THIS ROUTE IF YOU WANT THE REDIRECT TO WORK!!!
                this.props.history.push("/blockGroup/Self-Reflection-2022");
            }
            //console.log(group);
          } else {
            group = "";
            console.log("Error getting group!");
          }
        })
        return group;
      }

    quizDocumentsReference = firestore.collection("quizs");

    signInWithEmailLink = () => {
        const {user} = this.props;

        if (user) {
            return;
        }

        const emailLink = window.location.href;

        if (!emailLink) {
            return;
        }

        if (auth.isSignInWithEmailLink(emailLink)) {
            let emailAddress = localStorage.getItem("emailAddress");

            if (!emailAddress) {
                this.props.history.push("/");

                return;
            }

            authentication
                .signInWithEmailLink(emailAddress, emailLink)
                .then(value => {
                    const user = value.user;
                    const displayName = user.displayName;
                    const emailAddress = user.email;

                    this.props.openSnackbar(
                        `Signed in as ${displayName || emailAddress}`
                    );
                })
                .catch(reason => {
                    const code = reason.code;
                    const message = reason.message;

                    switch (code) {
                        case "auth/expired-action-code":
                        case "auth/invalid-email":
                        case "auth/user-disabled":
                            this.props.openSnackbar(message);
                            break;

                        default:
                            this.props.openSnackbar(message);
                            return;
                    }
                })
                .finally(() => {
                    this.props.history.push("/");
                });
        }
    };

    render() {
        // Properties
        const {user} = this.props;

        if (user) {
            return this.SignedInContent();
        }
        
        //Uncomment the lines below to enable the goal-setting redirect
        /*
        if(user !== null && auth.currentUser !== null && localStorage.getItem("hash") !== null) {
            this.fetchGroup();
            return null;
        }
        */

        return (
            <EmptyState
                title={process.env.REACT_APP_TITLE}
                description={process.env.REACT_APP_DESCRIPTION}
            />
        );
    }

    SignedInContent() {
        return (
            <Box width="95%" mx="auto" p={1}>
                {/*{this.state.quizList}*/}
            </Box>
        );
    }

    componentDidMount() {
        this.signInWithEmailLink();

        this.quizDocumentsReference.get().then(querySnapshot => {
            let resList = [];
            querySnapshot.forEach((doc, index) => {
                resList.push(
                    <QuizCard key={index + new Date()} title={doc.data().title}/>
                );
            });
        
            this.setState({quizList: resList});
        });
    }
}

HomeContent.propTypes = {
    // Properties
    user: PropTypes.object
};

export default withRouter(HomeContent);
