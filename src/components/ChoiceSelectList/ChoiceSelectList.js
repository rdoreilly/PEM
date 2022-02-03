import React, {useState} from 'react';
import Box from "@material-ui/core/Box";
import {Avatar, Menu} from "@material-ui/core";
import {Add, ArrowDropDown, Delete} from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import makeStyles from "@material-ui/core/styles/makeStyles";
import blue from "@material-ui/core/colors/blue";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import red from "@material-ui/core/colors/red";

const useStyles = makeStyles(theme => {
    return {
        buttonIcon: {
            backgroundColor: blue[500]
        },
        deleteIcon: {
            backgroundColor: red[500]
        },
        icon: {
            color: "white",
        },
        choiceContainer: {
            display: "flex",
            alignItems: "end"
        }
    }
})

const defaultState = {
    selectedItem: "none",
    menuOpen: false
}

function ChoiceSelectList(props) {
    const classes = useStyles();
    let {items, selectedItem, setItem, callback, addChoice} = {...props};

    const [anchorElement, setAnchorElement] = useState(null);
    const [state, setState] = useState({...defaultState});

    const closeMenu = () => {
        setAnchorElement(null);
    }

    return (
        <Box className={classes.choiceContainer}>
            <TextField value={selectedItem} onChange={(e) => callback(e.target.value)}/>
            <Box display="flex">
                <Avatar className={classes.buttonIcon} variant={"square"}>
                    <IconButton onClick={e => setAnchorElement(e.currentTarget)} className={classes.icon}>
                        <ArrowDropDown/>
                    </IconButton>
                </Avatar>
                <Avatar className={classes.buttonIcon} variant={"square"}>
                    <IconButton className={classes.icon} onClick={addChoice}>
                        <Add/>
                    </IconButton>
                </Avatar>
            </Box>
            <Menu anchorEl={anchorElement} keepMounted onClose={() => setAnchorElement(null)}
                  open={Boolean(anchorElement)}>
                {items.map(item =>
                    <MenuItem key={item} value={item} onClick={() => {
                        closeMenu();
                        setItem(item);
                    }}>
                        {item}
                    </MenuItem>
                )}
            </Menu>
        </Box>
    );
}

export default ChoiceSelectList;