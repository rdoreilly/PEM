import React, { useEffect, useState } from 'react';
import makeStyles from "@material-ui/core/styles/makeStyles";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import { Avatar, Button, FormControl, IconButton } from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import CreatedSurvey from "../CreatedSurvey/CreatedSurvey";
import { firestore } from "../../firebase";
import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import { PhotoLibrary, VideoLibrary } from '@material-ui/icons';
import { blue } from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
    container: {
        display: "flex",
        flexDirection: "column",
        marginLeft: "15px",
        rowGap: "1rem",
        maxWidth: "50%",
        [theme.breakpoints.down("sm")]: {
            justifyContent: "center",
            maxWidth: "90%",
            marginLeft: "0%"
        }
    },
    formElement: {
        marginTop: "10px",
        marginBottom: "10px"
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
    inputTag: {
        paddingTop: "5px",
        paddingBottom: "5px",
        paddingLeft: "15px",
    },
    items: {
        fontSize: theme.typography.pxToRem(15),
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    upload_image_row: {
        display: "flex",
        columnGap: "1rem",
        flexWrap: "wrap",
        rowGap: "1rem",
        alignItems: "center",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
    },
    iconAdd: {
        backgroundColor: blue[500],
    },
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

function QuizGroupPaneBody(props) {
    const classes = useStyles();
    const { state, setState } = { ...props }

    const siteRootURL = window.location.toString().split("/")[2];

    const quizDocumentsReference = firestore.collection("quizs");

    useEffect(() => {
        async function getDocs() {
            let quizNames = [];

            let querySnapshot = await quizDocumentsReference.get();

            querySnapshot.forEach(doc => {
                quizNames.push(doc.data().title);
            });
            setState({ ...state, quizNames: quizNames });
        }

        getDocs();
    }, []);

    const setVideo = event => {
        let video = event.target.files[0];
        setState({...state, video: video, video_name: video.name});
    };

    return (
        <Box className={classes.container}>
            <TextField value={state.title} className={classes.formElement} onChange={e => {
                setState({ ...state, title: e.target.value });
            }}
                variant="outlined" size="small" label="Title" />
            <Box className={classes.upload_image_row} display="flex" py={2}>
                <Avatar className={classes.iconAdd}>
                    <IconButton style={{ color: "white" }} component="label">
                        <VideoLibrary />
                        <input
                            onChange={setVideo}
                            accept="video/*"
                            type="file"
                            style={{ display: "none" }}
                        />
                    </IconButton>
                </Avatar>
                <Typography variant="body1">
                    {state.video_name !== undefined
                                ? state.video_name
                                : "No file chosen"}
                </Typography>
            </Box>
            <TextField multiline rows={4} className={classes.formElement}
                value={state.description}
                onChange={e => setState({ ...state, description: e.target.value })}
                variant="outlined" size="small" label="Description" />
            <FormControl>
                <InputLabel className={classes.inputTag} id={"content-select-label"}>Content</InputLabel>
                <Select
                    labelId="content-select-label"
                    multiple
                    value={state.selectedItem}
                    onChange={(e) => setState({ ...state, selectedItem: e.target.value })}
                    input={<Input className={classes.inputBox} />}
                    renderValue={(selected) => selected.join(', ')}
                    MenuProps={MenuProps}
                >
                    {state.quizNames.map((name) => (
                        <MenuItem key={name} value={name}>
                            <Checkbox checked={state.selectedItem.indexOf(name) > -1} />
                            <ListItemText primary={name} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

export default QuizGroupPaneBody;