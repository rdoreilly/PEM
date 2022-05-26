import React, { useEffect, useState } from 'react';
import { Breadcrumbs, Link, Typography } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import { firestore, auth } from "../../firebase";
import Card from "@material-ui/core/Card";
import Divider from "@material-ui/core/Divider";
import makeStyles from "@material-ui/core/styles/makeStyles";
import QuizCard from "../QuizCard/QuizCard";
import { Link as RouterLink } from 'react-router-dom';
import TestVideo from '../TestVideo/TestVideo';
import { FlaskRemove } from 'mdi-material-ui';
import RecordRTC from 'recordrtc';
import { storage } from '../../firebase';
import CustomVideoComponent from '../CustomVideoComponent/CustomVideo';

const group = window.location.toString().split("/group/")[1];

const useStyles = makeStyles({
    groupBox: {
        display: "flex",
        flexDirection: "column",
        rowGap: "1rem"
    },
    testHeader: {
        display: "flex",
        justifyContent: "space-between"
    }
})

async function setCompleted(blockGroupTitle, blockTitle, quizGroupTitle, userDoc) {
    const docRef = firestore.collection("userID").doc(localStorage.getItem("hash"));

    if (userDoc.results[blockGroupTitle][blockTitle]["completed"] === undefined)
        userDoc.results[blockGroupTitle][blockTitle]["completed"] = [quizGroupTitle];
    else if (!userDoc.results[blockGroupTitle][blockTitle]["completed"].includes(quizGroupTitle))
        userDoc.results[blockGroupTitle][blockTitle]["completed"].push(quizGroupTitle);
    else
        return;

    await docRef.set(userDoc);
}

var storageRef = storage.ref();

function GroupContent(props) {
    const { blockGroupTitle, blockTitle, quizGroupTitle } = { ...props.location.state }
    const groupDocumentReference = firestore.collection("quizGroups").doc(quizGroupTitle);
    let existingResults = null;
    if(auth.currentUser !== null && localStorage.getItem("hash") !== null){
        existingResults = firestore.collection("userID").doc(localStorage.getItem("hash"));
    }
    const classes = useStyles();

    const defaultState = {
        title: "",
        description: "",
        content: [],
        completed: false,
        video_url: null,
        userData: []
    }

    const [state, setState] = useState({ ...defaultState });
    const [recorder, setRecorder] = useState(null);

    function recordFunction() {
        if (recorder !== null) {
            recorder.reset();
            recorder.startRecording();
        }
    }

    async function setURL(uploadURL){
        let userDoc = (await existingResults.get()).data();

        if(userDoc.result === undefined)
            userDoc.result = {};
        
        if(userDoc.result[blockGroupTitle] === undefined)
            userDoc.result[blockGroupTitle] = {};

        if(userDoc.result[blockGroupTitle][blockTitle] === undefined)
            userDoc.result[blockGroupTitle][blockTitle] = {}
        
        if(userDoc.result[blockGroupTitle][blockTitle][quizGroupTitle] === undefined)
            userDoc.result[blockGroupTitle][blockTitle][quizGroupTitle] = {}
        
        userDoc.result[blockGroupTitle][blockTitle][quizGroupTitle]["video_url"] = uploadURL;
        existingResults.update(userDoc);
    }

    function stopRecording() {
        const tempFunc = async () => {
            await recorder.stopRecording(async function () {
                let blob = recorder.getBlob();
                let uploadURL = `results/${localStorage.getItem('hash')}/${blockGroupTitle}/${blockTitle}/${quizGroupTitle}_description.webm`;
                let ref = storageRef.child(uploadURL);
                let snapshot = await ref.put(blob);
                let downloadURL = await snapshot.ref.getDownloadURL();
                //setURL(downloadURL);
            });
        };

        tempFunc();
    }

    useEffect(() => {
        //Set up recorder
        /*navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: true,
            })
            .then(async function (stream) {
                setRecorder(RecordRTC(stream, {
                    type: "video",
                    mimeType: "video/webm",
                }))
            });
            */

        //Fetch details on the quizGroup to be loaded
        async function getGroupDetails() {
            let doc = await groupDocumentReference.get();
            let data = doc.data();

            let uData = undefined;

            let completedQuiz = [];
            let isCompleted = false;

            if (auth.currentUser !== null) {
                uData = (await existingResults.get()).data();

                if (uData.results !== undefined && uData.results[blockGroupTitle] != undefined && uData.results[blockGroupTitle][blockTitle] != undefined && uData.results[blockGroupTitle][blockTitle][quizGroupTitle] !== undefined)
                    completedQuiz = Object.keys(uData.results[blockGroupTitle][blockTitle][quizGroupTitle]);
       
                if (completedQuiz.length === Object.keys(data.content).length) {
                    setCompleted(blockGroupTitle, blockTitle, quizGroupTitle, uData);
                    isCompleted = true;
                }
             }

            let newState = {
                title: data.title,
                description: data.description,
                content: data.content,
                completed: isCompleted,
                video_url: data.video_url,
                userData: completedQuiz
            };

            setState(newState);
        }

        getGroupDetails()
    }, []);


    return (
        <Box className={classes.groupBox} width={3 / 5} mx="auto" my={3}>
            <Breadcrumbs aria-label="breadcrumb">
                <Link color="inherit" component={RouterLink} to={`/blockGroup/${blockGroupTitle}`}>
                    {blockGroupTitle.replace(/_/g, ' ')}
                </Link>
                <Link color="inherit" component={RouterLink} to={{
                    pathname: `/blockGroup/${blockGroupTitle}/block/${blockTitle}`,
                    state: {
                        blockGroupTitle: blockGroupTitle,
                        blockTitle: blockTitle
                    }
                }}>
                    {blockTitle.replace(/_/g, ' ')}
                </Link>
                <Typography color="textPrimary">{quizGroupTitle.replace(/_/g, ' ')}</Typography>
            </Breadcrumbs>
            <Box>
                <Card>
                    <Box padding={2}>
                        <Box className={classes.testHeader}>
                            <Typography variant="h5" component="h2">
                                {state.title.replace(/_/g, ' ')}
                            </Typography>
                            {state.video_url != undefined && <TestVideo />}
                        </Box>
                        <Typography variant="body1" component="pre" style={{ whiteSpace: "pre-wrap" }}>
                            {state.description}
                        </Typography>
                        <br />
                        {state.video_url != undefined &&
                            <CustomVideoComponent
                                recordingEnabled={true}
                                mediaURL={state.video_url}
                                record={() => {recordFunction()}}
                                stopRecording={() => {stopRecording()}}
                                width={"100%"} />}
                    </Box>
                </Card>
            </Box>
            <Divider />
            {state.content.map((element, index) =>
                <QuizCard
                    // disabled={(state.userData.includes(element))} 
                    disabled={(index < state.userData.length || index > state.userData.length)}
                    text={getText(index, state.userData)}
                    key={element}
                    quizTitle={element}
                    quizGroupTitle={quizGroupTitle}
                    blockTitle={blockTitle}
                    blockGroupTitle={blockGroupTitle} />
            )}
        </Box>)
}

function getText(index, list) {
    if (index < list.length)
        return "Completed"
    else if (index > list.length)
        return "Locked"
    else
        return "Enter"
}

export default GroupContent;