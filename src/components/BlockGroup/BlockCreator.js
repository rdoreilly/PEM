import { Avatar, Box, Button, Card, Divider, IconButton, makeStyles, Modal, TextField, Typography } from '@material-ui/core';
import { Add, ArrowDownward, ArrowUpward, Close, ExpandLess, ExpandMore, MoreHoriz } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import BlockElement from './BlockElement';
import BlockModal from './BlockModal';

const useStyles = makeStyles(theme => ({
    container: {
        display: "flex",
        flexDirection: "column",
        rowGap: "0.3rem",
        padding: "0.5rem 1rem 0.5rem 1rem",
        border: "#e0e0e0",
        borderRadius: "5px",
        borderWidth: "1px",
        borderStyle: "solid",
    },
    blockRow: {
        display: "flex",
        columnGap: "2rem",
        justifyContent: "space-between",
    },
    arrows: {
        width: theme.spacing(3.5),
        height: theme.spacing(3.5)
    },
    parent: {
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        rowGap: "0.5rem"
    },
    blockHeader: {
        display: "flex",
        justifyContent: "space-between",
        columnGap: "2rem"
    },
}));

const blockObj = () => {
    return {
        title: "New Block",
        content: [],
        random: false
    }
}

function BlockCreator(props) {
    const classes = useStyles();
    let {quizTitles, blockList, setBlockList} = props;

    let [titleList, setTitleList] = useState([]);

    useEffect(() => {
        if(blockList.length === 0) addBlock(blockObj(), blockList);

        let titles = getBlockTitle(blockList);
        setTitleList(titles);
    }, [blockList]);

    const addBlock = (block, bList) => event => {
        if(titleList.includes(block.title)) return;
        bList.push(block);
        setBlockList([...bList]);
    }

    const moveBlockUp = index => event => {
        if (index <= 0) return;

        let tmp = blockList[index];
        blockList[index] = blockList[index - 1];
        blockList[index - 1] = tmp;
        setBlockList([...blockList]);
    }

    const moveBlockDown = index => event => {
        if (index >= blockList.length - 1) return;

        let tmp = blockList[index];
        blockList[index] = blockList[index + 1];
        blockList[index + 1] = tmp;
        setBlockList([...blockList]);

    }

    const saveBlock = index => block => {
        blockList[index] = block;
        setBlockList([...blockList]);
    }

    return (
        <Card className={classes.parent}>
            <Box className={classes.blockHeader}>
                <Typography>Blocks</Typography>
                <Avatar variant="rounded" className={classes.arrows}>
                    <IconButton onClick={addBlock(blockObj(), blockList)}>
                        <Add />
                    </IconButton>
                </Avatar>
            </Box>
            <Box className={classes.container}>
                {blockList.map((item, index) => 
                <BlockRow 
                    key={item.title} 
                    quizTitles={quizTitles}
                    save={saveBlock(index)}
                    index={index} 
                    block={item} 
                    moveUp={moveBlockUp} 
                    moveDown={moveBlockDown}/>)}
            </Box>
        </Card>
    )
}

function BlockRow(props){
    let {block, index, save, moveUp, moveDown, quizTitles} = props;
    let [modalOpen, setModal] = useState(false); 
    let closeModal = () => setModal(false);
    let openModal = () => setModal(true);
    
    return (
        <div>
            <BlockElement title={block.title} index={index} moveUp={moveUp} openModal={openModal} moveDown={moveDown} />
            <BlockModal quizTitles={quizTitles} save={save} block={block} close={closeModal} isOpen={modalOpen}/>
        </div>
    )
}

function getBlockTitle(blockList) {
    return blockList.map(item => item.title);
}

export default BlockCreator;