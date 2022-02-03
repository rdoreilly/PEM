import { Avatar, Box, IconButton, makeStyles, Typography } from '@material-ui/core';
import { ArrowDownward, ArrowUpward, MoreHoriz } from '@material-ui/icons';
import React from 'react';

const useStyles = makeStyles(theme => ({
    container: {
        display: "flex",
        flexDirection: "column",
        rowGap: "0.3rem",
        padding: "0.5rem 1rem 0.5rem 1rem",
        border: "#e0e0e0",
        borderRadius: "5px",
        borderWidth: "1px",
        borderStyle: "solid"
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
    rowControls: {
        display: "flex",
        columnGap: "0.5rem"
    },
}));

function BlockElement(props) {
    const classes = useStyles();
    let { title, index, moveDown, moveUp, openModal} = props;

    return (
        <Box className={classes.blockRow}>
            <Typography>{title}</Typography>
            <Box className={classes.rowControls}>
                <Avatar className={classes.arrows} variant="rounded">
                    <IconButton onClick={moveUp(index)}>
                        <ArrowUpward />
                    </IconButton>
                </Avatar>
                <Avatar className={classes.arrows} variant="rounded">
                    <IconButton onClick={moveDown(index)}>
                        <ArrowDownward />
                    </IconButton>
                </Avatar>
                <Avatar className={classes.arrows} variant="rounded">
                    <IconButton onClick={openModal}>
                        <MoreHoriz />
                    </IconButton>
                </Avatar>
            </Box>
        </Box>
    )
}

export default BlockElement;