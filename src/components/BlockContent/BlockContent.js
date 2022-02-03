import React, { useEffect, useState } from 'react';
import { Typography } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import { firestore, auth } from "../../firebase";
import Card from "@material-ui/core/Card";
import Divider from "@material-ui/core/Divider";
import makeStyles from "@material-ui/core/styles/makeStyles";
import BlockGroupCard from './BlockGroupCard';
import RecordRTC from 'recordrtc';
import CustomVideoComponent from '../CustomVideoComponent/CustomVideo';
import { storage } from '../../firebase';
import TestVideo from '../TestVideo/TestVideo';

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
});

var storageRef = storage.ref();

async function getCompletedList(blockGroupTitle) {
    const userDocRef = firestore.collection("userID").doc(localStorage.getItem("hash"));

    let userDoc = (await userDocRef.get()).data();

    if (userDoc.results !== undefined) {
        if (userDoc.results[blockGroupTitle] !== undefined) {
            let completeList = userDoc.results[blockGroupTitle]["completed"]
            return (completeList !== undefined) ? completeList : []
        }
    }
    return []
}

function BlockContent(props) {
    let gr = window.location.toString().split("/blockGroup/")[1]
    let group = gr.replace(/_/g, ' ');
    const groupDocumentReference = firestore.collection("blockGroups");
    const existingResults = firestore.collection("userID").doc(localStorage.getItem("hash"));
    const classes = useStyles();

    const defaultState = {
        title: "",
        description: "",
        content: [],
        completed: [],
        video_url: null
    }

    const [state, setState] = useState({ ...defaultState });
    const [recorder, setRecorder] = useState(null);

    function recordFunction() {
        if (recorder !== null) {
            recorder.reset();
            recorder.startRecording();
        }
    }

    async function setURL(uploadURL) {
        let userDoc = (await existingResults.get()).data();

        if (userDoc.result === undefined)
            userDoc.result = {};

        if (userDoc.result[gr] === undefined)
            userDoc.result[gr] = {};

        userDoc.result[gr]["video_url"] = uploadURL;
        existingResults.update(userDoc);
    }

    function stopRecording() {
        const tempFunc = async () => {
            await recorder.stopRecording(async function () {
                let blob = recorder.getBlob();
                let uploadURL = `results/${localStorage.getItem('hash')}/${gr}_description.webm`;
                let ref = storageRef.child(uploadURL);
                let snapshot = await ref.put(blob);
                let downloadURL = await snapshot.ref.getDownloadURL();
                setURL(downloadURL);
            });
        };

        tempFunc();
    }

    useEffect(() => {
        //Set up recorder
        navigator.mediaDevices
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

        async function getGroupDetails() {
            const bg = await groupDocumentReference.get();
            let completedList = await getCompletedList(gr);

            let newState;
            bg.forEach((doc) => {
                let data = doc.data();
                if (data.title === group) {
                    newState = {
                        title: data.title,
                        description: data.description,
                        content: data.blockList,
                        completedList: completedList,
                        video_url: data.videoDetails.video_url
                    };
                }
            });

            setState(newState);
        }

        getGroupDetails()
    }, []);


    return (
        <Box className={classes.groupBox} width={3 / 5} mx="auto" my={3}>
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
                                record={() => { recordFunction() }}
                                stopRecording={() => { stopRecording() }}
                                width={"100%"} />}
                    </Box>
                </Card>
            </Box>
            <Divider />
            {state.content.map((element, index) =>
                <BlockGroupCard
                    disabled={(index < state.completedList.length || index > state.completedList.length)}
                    key={element}
                    text={getText(index, state.completedList)}
                    title={element.title}
                    group={group.replace(/ /g, '_')}
                    block={element} />
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

export default BlockContent;