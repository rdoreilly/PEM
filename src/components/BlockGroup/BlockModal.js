import { Avatar, Box, Switch, Button, Card, FormControlLabel, IconButton, makeStyles, Modal, TextField, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Input } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React, { useState } from 'react';

const useStyles = makeStyles(theme => ({
    arrows: {
        width: theme.spacing(3.5),
        height: theme.spacing(3.5),
        alignSelf: "flex-end"
    },
    blockModal: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    modalBox: {
        display: "flex",
        flexDirection: "column",
        padding: "1rem",
        rowGap: "0.5rem"
    },
    inputBox: {
        borderRadius: "5px",
        borderColor: "#c4c4c4",
        borderWidth: "1.5px",
        borderStyle: "solid",
        paddingTop: "5px",
        paddingBottom: "5px",
        paddingLeft: "15px",
        paddingRight: "10px"
    },
    acceptButton: {
        alignSelf: "flex-end"
    },
    inputTag: {
        paddingTop: "5px",
        paddingBottom: "5px",
        paddingLeft: "15px",
    },
    selectBox: {
        width: "100%"
    }
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

function BlockModal(props) {
    const classes = useStyles();
    let { save, block, close, isOpen, quizTitles } = props;

    let [title, setTitle] = useState(block.title);
    let [random, setRandom] = useState(block.random);
    let [content, setContent] = useState(block.content);

    const cancel = () => {
        setTitle(block.title);
        setRandom(block.random);
        setContent(block.content);
        close();
    }

    const saveBlock = event => {
        let newBlock = {
            title: title,
            random: random,
            content: content
        }
        save(newBlock);
        close();
    }

    return (
        <Modal className={classes.blockModal} onClose={cancel} open={isOpen}>
            <Box>
                <Card className={classes.modalBox}>
                    <Avatar variant="rounded" className={classes.arrows}>
                        <IconButton onClick={cancel}>
                            <Close />
                        </IconButton>
                    </Avatar>
                    <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} size="small" variant="outlined" />
                    <Box>
                        <FormControlLabel
                            control={<Switch checked={random} onChange={e => setRandom(e.target.checked)} name="Random" />}
                            label="Randomise Block Order"
                        />
                    </Box>
                    <Box>
                        <FormControl className={classes.selectBox}>
                            <InputLabel className={classes.inputTag} id={"content-select-label"}>Content</InputLabel>
                            <Select
                                labelId="content-select-label"
                                multiple
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                input={<Input className={classes.inputBox} />}
                                renderValue={(selected) => selected.join(', ')}
                                MenuProps={MenuProps}
                            >
                                {quizTitles.map((name) => (
                                    <MenuItem key={name} value={name}>
                                        <Checkbox checked={content.indexOf(name) > -1} />
                                        <ListItemText primary={name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box className={classes.acceptButton}>
                        <Button variant="outlined" onClick={saveBlock} color="primary">Accept</Button>
                    </Box>
                </Card>
            </Box>
        </Modal>
    )
}

export default BlockModal;