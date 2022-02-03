import React from 'react';
import Box from "@material-ui/core/Box";
import { FormControlLabel, makeStyles, TextField, Switch, Typography, Avatar, IconButton } from '@material-ui/core';
import BlockCreator from './BlockCreator';
import { VideoLibrary } from '@material-ui/icons';

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
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    urlPreview: {
        borderRadius: "5px",
        borderWidth: "1px",
        borderColor: "#c4c4c4",
        borderStyle: "solid",
        padding: "10px 10px 10px 10px"
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
}));

const siteRootURL = window.location.toString().split("/")[2];

function BlockGroupBody(props) {
    const classes = useStyles();

    let {
        blockList,
        setBlockList,
        recording,
        setRecording,
        description,
        setDescription,
        quizTitles,
        title,
        setTitle,
        videoDetails,
        setVideoDetails } = props;

    return (
        <Box className={classes.container}>
            <TextField
                value={title}
                placeholder="Enter block title"
                className={classes.formElement}
                onChange={e => { setTitle(e.target.value) }}
                variant="outlined"
                size="small"
                label="Title"
            />
            <TextField
                value={description}
                placeholder="Enter Description"
                multiline
                row={4}
                className={classes.formElement}
                onChange={e => { setDescription(e.target.value) }}
                variant="outlined"
                label="Description"
            />
            <Box>
                <Typography className={classes.heading}>URL Preview</Typography>
                <Box className={classes.urlPreview}>
                    <Typography>https://{siteRootURL}/blockGroup/{title.replace(/ /g, "_")}</Typography>
                </Box>
            </Box>
            <Box>
                <FormControlLabel
                    control={<Switch checked={recording} onChange={e => setRecording(e.target.checked)} name="Record Video" />}
                    label="Record Video"
                />
            </Box>
            <Box className={classes.upload_image_row} display="flex" py={2}>
                <Avatar className={classes.iconAdd} variant="rounded">
                    <IconButton style={{ color: "white" }} component="label">
                        <VideoLibrary />
                        <input
                            onChange={setVideoDetails}
                            accept="video/*"
                            type="file"
                            style={{ display: "none" }}
                        />
                    </IconButton>
                </Avatar>
                <Typography variant="body1">
                    {(videoDetails !== undefined && videoDetails.video_name !== undefined && videoDetails.video_name !== "")
                        ? videoDetails.video_name
                        : "No file chosen"}
                </Typography>
            </Box>
            <BlockCreator quizTitles={quizTitles} blockList={blockList} setBlockList={setBlockList} />
        </Box>
    )
}

export default BlockGroupBody;