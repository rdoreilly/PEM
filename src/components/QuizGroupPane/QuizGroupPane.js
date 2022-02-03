import React, { useState } from 'react';
import { Accordion, AccordionSummary, Card, makeStyles, Typography } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import QuizGroupPaneBody from "../QuizGroupPaneBody/QuizGroupPaneBody";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import firebase, { firestore } from "../../firebase";

const ref = firebase.storage().ref();

const useStyles = makeStyles(theme => ({
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    bodyContainer: {
        [theme.breakpoints.down("sm")]: {
            justifyContent: "center",
        }
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    bottomBox: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        columnGap: "1rem",
        padding: "1rem"
    }
}));

function QuizGroupPane(props) {
    const classes = useStyles();

    const defaultState = (props.update) ? {
        title: props.title,
        results: props.results,
        users: props.users,
        original_title: props.title,
        description: props.description,
        selectedItem: props.content,
        items: props.links,
        update: props.update,
        quizNames: [],
        video: props.video,
        video_name: props.video_name
    } : {
            title: "",
            results: {},
            users: {},
            original_title: "",
            description: "",
            quizNames: [],
            selectedItem: [],
            update: props.update,
            items: {},
            video: null,
            video_name: null
        }

    const [state, setState] = useState({ ...defaultState });

    const resetState = () => {
        setState({ ...defaultState });
    }

    return (
        <Box>
            <Card>
                <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography className={classes.heading}>
                            {(props.update) ? "Edit" : "Create Group"}
                        </Typography>
                        <Typography className={classes.secondaryHeading}>
                            {state.title}
                        </Typography>
                    </AccordionSummary>
                    <Box mb={"1rem"} className={classes.bodyContainer} display="flex">
                        <QuizGroupPaneBody state={state} setState={setState} />
                    </Box>
                    <Divider />
                    <Box className={classes.bottomBox}>
                        {props.update && <Button color={"secondary"} variant={"contained"} onClick={() =>
                            deleteGroup(state, props.callback)
                        }>Delete</Button>}
                        <Button
                            onClick={() => submitQuiz(state, resetState, props.update, props.callback)}
                            color={"primary"} variant={"contained"}>{props.update ? "Update" : "Create"}</Button>
                    </Box>
                </Accordion>
            </Card>
        </Box>
    )
}

async function deleteGroup(state, callback) {
    const quizDocumentReference = firestore
        .collection("quizGroups")
        .doc(state.title);

    try {
        await quizDocumentReference.delete();
        callback();
        alert("Survey Deleted");

    } catch (err) {
        console.log(`FAIL: ${JSON.stringify(err, null, 4)}`);
    }
}

async function submitQuiz(state, resetState, isUpdate, callback) {
    let quizGroupDocumentReference = firestore.collection("quizGroups").doc(state.title);
    let oldGroupDocumentReference;

    let url = null;

    let data = {
        title: state.title,
        description: state.description,
        content: state.selectedItem,
        results: state.results !== undefined ? state.results : {},
        users: state.users !== undefined ? state.users : {},
        video_url: url,
    }

    if (state.video != null){
        data.video_name = state.video.name;
        url = await submitFile(state.video);
        data.video_url = url;
    }

    if (state.update) oldGroupDocumentReference = firestore.collection("quizGroups").doc(state.original_title);

    try {
        await quizGroupDocumentReference.set(data);
        if (state.original_title !== state.title && state.original_title.length > 0) await oldGroupDocumentReference.delete();
        alert((isUpdate) ? "Group Updated" : "Group Created");
        resetState();
        callback();

    } catch (err) {
        console.log(err);
        console.log(`FAIL: ${JSON.stringify(data, null, 4)}`);
    }
}

async function submitFile(video) {
    if (video !== undefined) {
        let videoRef = ref.child(
            "quizVideos/" + video.name
        );
        let metadata = {
            contentType: video.type
        };

        let snapshotRef = await videoRef.put(video, metadata);
        let url = await snapshotRef.ref.getDownloadURL();

        return url;
    }

    return null;
}

export default QuizGroupPane;