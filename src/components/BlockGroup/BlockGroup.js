import React, { useState } from 'react';
import { Accordion, AccordionSummary, Card, Typography, Button, useRadioGroup } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import BlockGroupBody from './BlockGroupBody';
import firebase, { firestore } from '../../firebase';

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
    saveButton: {
        display: "flex",
        justifyContent: "flex-end",
        padding: "0px 10px 10px 0px",
        columnGap: "10px"
    }
}));

const blockObj = () => {
    return {
        title: "New Block",
        content: [],
        random: false
    }
}

const defaultState = {
    title: "New Block",
    description: "",
    recording: false,
    blockList: [blockObj()],
    videoDetails: {
        video_name: "",
        video_url: ""
    }
}

const blockGroupRef = firestore.collection("blockGroups");
const ref = firebase.storage().ref();

function BlockGroup(props) {
    const classes = useStyles();
    let { quizTitles, blockGroupList, updateGroupList, update, blockGroup, index, originalTitle } = props;

    let refBlock = update ? blockGroup : defaultState;

    let [title, setTitle] = useState(refBlock.title);
    let [description, setDescription] = useState(refBlock.description);
    let [blockList, setBlockList] = useState(refBlock.blockList);
    let [recording, setRecordState] = useState(refBlock.recording);
    let [videoDetails, setVideoDetails] = useState(refBlock.videoDetails);
    let [video, setVideo] = useState(null);

    function reset() {
        setTitle(defaultState.title);
        setDescription(defaultState.description);
        setRecordState(false);
        setBlockList([{
            title: "New Block",
            content: [],
            random: false,
        }]);
        setVideoDetails({
            video_name: "",
            video_url: ""
        });
        setVideo(null);
    }

    let oTitle = update ? originalTitle : title;

    async function save(blockList, title, recording, description, oTitle) {
        let retObj = {
            title: title,
            description: description,
            recording: recording,
            blockList: blockList,
            originalTitle: oTitle,
            videoDetails: videoDetails
        };

        const conclusion = () => {
            updateGroupList([...blockGroupList]);

            if (!update)
                reset();
        }

        if (update) {    
            const docUpdate = async () => {
                if(video != null) retObj["videoDetails"]["video_url"] = await submitFile(video);
                blockGroupList[index] = retObj;
                await blockGroupRef.doc(retObj.originalTitle).set(retObj);
                conclusion();
            } 

            docUpdate();  
        }
        else {
            const newSave = async () => {
                if(video != null) retObj["video_details"]["video_url"] = await submitFile(video);
                blockGroupList.push(retObj);
                await blockGroupRef.doc(retObj.originalTitle).set(retObj);
                conclusion();
            }
            newSave();
        }
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
                            {title}
                        </Typography>
                    </AccordionSummary>
                    <Box mb={"1rem"} className={classes.bodyContainer} display="flex">
                        <BlockGroupBody
                            blockList={blockList}
                            setBlockList={setBlockList}
                            recording={recording}
                            setRecording={setRecordState}
                            quizTitles={quizTitles}
                            description={description}
                            setDescription={setDescription}
                            title={title}
                            setTitle={setTitle}
                            videoDetails={videoDetails}
                            setVideoDetails={(event) => {
                                let video = event.target.files[0];
                                setVideoDetails({
                                    video_name: video.name
                                });
                                setVideo(video);
                            }} />
                    </Box>
                    <Box className={classes.saveButton}>
                        {update && <Button variant="outlined" onClick={() => downloadData(title)}>Download Data</Button>}
                        <Button onClick={() => save(blockList, title, recording, description, oTitle)} variant="outlined" color="primary">{update ? "Update" : "Save"}</Button>
                    </Box>
                </Accordion>
            </Card>
        </Box>
    )
}

const writeToTextFile = (data, title) => {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', `${title}.json`);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
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

async function downloadData(title){
    const userCollection = firestore.collection("userID");

    let userDocs = await userCollection.get();

    let resList = []

    userDocs.forEach(doc => {
        let data = doc.data();
        if(data.results === undefined) return;
        if(data.results[title.replace(/ /g, '_')] === undefined) return;
        console.log(data);
        resList.push({email: data.email, results: data.results[title]});
    });

    resList.forEach(element => writeToTextFile(element, `${element.email}_${title}`));
}

export default BlockGroup;