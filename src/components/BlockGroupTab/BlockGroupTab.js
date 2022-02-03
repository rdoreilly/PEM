import React, {useEffect, useState} from 'react';
import Box from "@material-ui/core/Box";
import {makeStyles} from "@material-ui/styles";
import BlockGroup from "../BlockGroup/BlockGroup";
import { firestore } from "../../firebase";

const useStyles = makeStyles({
    groupList: {
        display: "flex",
        flexDirection: "column",
        rowGap: "1rem"
    }
});

const quizGroupRef = firestore.collection("quizGroups");
const blockGroupRef = firestore.collection("blockGroups");

function BlockGroupTab() {
    const classes = useStyles();

    let [quizGTitle, setQuizGTitle] = useState([]);
    let [blockGroupList, setBlockGroupList] = useState([]);

    useEffect(() => {
        const setTitle = async () => setQuizGTitle(await fetchQuizGroupLabels());
        setTitle();
        const getBlocks = async () => setBlockGroupList(await fetchBlockGroups());
        getBlocks();
    }, [blockGroupList]);

    return (
        <Box className={classes.groupList}>
            <BlockGroup blockGroupList={blockGroupList} updateGroupList={setBlockGroupList} quizTitles={quizGTitle} update={false}/>
            {blockGroupList.map((item, index) => {
                return <BlockGroup
                    key={item.title}
                    index={index}
                    blockGroupList={blockGroupList} 
                    updateGroupList={setBlockGroupList} 
                    quizTitles={quizGTitle} 
                    update={true}
                    blockGroup={item}
                    originalTitle={item.originalTitle}/>
            }
            )}
        </Box>);
}

async function fetchQuizGroupLabels(){
    let querySnapshot = await quizGroupRef.get();
    let resList = [];
    querySnapshot.forEach(doc => resList.push(doc.data().title));

    return resList; 
}

async function fetchBlockGroups(){
    let querySnapshot = await blockGroupRef.get();
    let resList = [];
    querySnapshot.forEach(doc => resList.push(doc.data()));

    return resList;
}

export default BlockGroupTab;