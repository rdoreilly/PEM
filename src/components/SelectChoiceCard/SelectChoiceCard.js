import React, {useEffect} from 'react';
import MultipleChoiceCard from "../MultipleChoiceCard/MultipleChoiceCard";
import {Box, RadioGroup} from "@material-ui/core";
import Select from "@material-ui/core/Select";
import {makeStyles} from "@material-ui/styles";
import Input from "@material-ui/core/Input";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";

const useStyles = makeStyles({
    inputBox: {
        borderRadius: "5px",
        borderColor: "#c4c4c4",
        borderWidth: "1.5px",
        borderStyle: "solid",
        paddingTop: "5px",
        paddingBottom: "5px",
        paddingLeft: "15px",
        paddingRight: "10px",
        minWidth: "16rem"
    },
})

function SelectChoiceCard(props) {
    const {
        state,
        setState,
        element,
        callback,
        title
    } = {...props}

    const classes = useStyles();

    let choices = element.choices;
    if (props.state.res.answers[props.title] === undefined) {
        props.callback(" ");
    }

    return (
        <Box p={1} display="flex" justifyContent="center">
            <Select
                value={state.res.answers[title]}
                onChange={setAnswer(callback, title)}
                input={<Input className={classes.inputBox}/>}
                disabled={props.disabled}
            >
                {Object.keys(choices).map(element =>
                    <MenuItem key={choices[element]} value={choices[element]}>
                        <ListItemText primary={choices[element]}/>
                    </MenuItem>
                )}
            </Select>
        </Box>
    )
}

const setAnswer = (callback, element) => event => {
    let answer = event.target.value;
    callback(answer);
};

export default SelectChoiceCard;