import React, { useEffect, useState } from 'react';
import { Breadcrumbs, Link, Typography } from "@material-ui/core";
import { Link as RouterLink } from 'react-router-dom';
import { MemoryRouter as Router } from 'react-router';
import Box from "@material-ui/core/Box";
import { firestore } from "../../firebase";
import Card from "@material-ui/core/Card";
import Divider from "@material-ui/core/Divider";
import makeStyles from "@material-ui/core/styles/makeStyles";
import BlockCard from "./BlockCard"
const useStyles = makeStyles({
    groupBox: {
        display: "flex",
        flexDirection: "column",
        rowGap: "1rem"
    }
});

async function getCompletedList(blockGroupTitle, blockTitle) {
    const userDocRef = firestore.collection("userID").doc(localStorage.getItem("hash"));

    let userDoc = (await userDocRef.get()).data();

    if (userDoc.results !== undefined) {
        if (userDoc.results[blockGroupTitle] !== undefined) {
            if (userDoc.results[blockGroupTitle][blockTitle] !== undefined) {
                let completeList = userDoc.results[blockGroupTitle][blockTitle]["completed"]
                return (completeList !== undefined) ? completeList : []
            }
        }
    }
    return []
}

async function setOrder(content, blockGroupTitle, blockTitle) {
    const userDocRef = firestore.collection("userID").doc(localStorage.getItem("hash"));

    let userDoc = (await userDocRef.get()).data();

    if (userDoc.results === undefined)
        userDoc["results"] = {};
    if (userDoc.results[blockGroupTitle] === undefined)
        userDoc.results[blockGroupTitle] = {};
    if (userDoc.results[blockGroupTitle][blockTitle] === undefined)
        userDoc.results[blockGroupTitle][blockTitle] = {};

    let retList = [];

    if (userDoc.results[blockGroupTitle][blockTitle]["order"] === undefined) {
        retList = [...content];
        userDoc.results[blockGroupTitle][blockTitle]["order"] = retList.sort(() => Math.random() - 0.5);
        await userDocRef.set(userDoc);
    }

    return userDoc.results[blockGroupTitle][blockTitle]["order"];
}

async function setCompleted(blockGroupTitle, blockTitle, listA, listB) {
    const userDocRef = firestore.collection("userID").doc(localStorage.getItem("hash"));
    if (listA.length === listB.length) {
        let userDoc = (await userDocRef.get()).data();

        if (userDoc.results !== undefined) {
            if (userDoc.results[blockGroupTitle] !== undefined) {
                if (userDoc.results[blockGroupTitle]["completed"] === undefined)
                    userDoc.results[blockGroupTitle]["completed"] = [blockTitle];
                else if (!userDoc.results[blockGroupTitle]["completed"].includes(blockTitle))
                    userDoc.results[blockGroupTitle]["completed"].push(blockTitle);
                else
                    return;

                await userDocRef.set(userDoc);
            }
        }
    }

    else
        return;
}

function BlockPage(props) {
    const groupDocumentReference = firestore.collection("blockGroups");
    const classes = useStyles();

    const defaultState = {
        title: "",
        content: [],
        group: 'unset',
        completed: [],
        random: false
    }

    const [state, setState] = useState({ ...defaultState });

    useEffect(() => {

        const fetchBlock = async () => {
            let blockGroups = await groupDocumentReference.get();
            let completeList = await getCompletedList(props.location.state.blockGroupTitle, props.location.state.blockTitle);

            blockGroups.forEach((doc) => {
                let blockGroup = doc.data();
                if (blockGroup.title === props.location.state.blockGroupTitle.replace(/_/g, ' ')) {
                    blockGroup.blockList.forEach(block => {
                        if (block.title === props.location.state.blockTitle) {
                            setCompleted(props.location.state.blockGroupTitle, block.title, completeList, block.content);
                            const setBlockContent = async () => {
                                if(block.random) block.content = await setOrder(block.content, props.location.state.blockGroupTitle, block.title);
                                setState({ ...block, group: props.location.state.blockGroupTitle, completedList: completeList })
                            }
                            setBlockContent();
                        }
                    });
                }
            });
        }

        fetchBlock();
    }, []);


    return (
        <Box className={classes.groupBox} width={3 / 5} mx="auto" my={3}>
            <Breadcrumbs aria-label="breadcrumb">
                <Link color="inherit" component={RouterLink} to={`/blockGroup/${state.group}`}>
                    {state.group.replace(/_/g, ' ')}
                </Link>
                <Typography color="textPrimary">{state.title}</Typography>
            </Breadcrumbs>
            <Box>
                <Card>
                    <Box padding={2}>
                        <Typography variant="h5" component="h2">
                            {state.title}
                        </Typography>
                    </Box>
                </Card>
            </Box>
            <Divider />
            {state.content.map((element, index) =>
                <BlockCard
                    disabled={(index < state.completedList.length || index > state.completedList.length)}
                    key={element}
                    text={getText(index, state.completedList)}
                    quizGroupTitle={element}
                    blockGroupTitle={state.group.replace(/ /g, '_')}
                    blockTitle={state.title} />
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

export default BlockPage;