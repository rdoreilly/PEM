import React, {useState} from "react";
import {Box, TextField, makeStyles} from "@material-ui/core";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        rowGap: "1rem"
    }
});

function UnlimitedAnswer(props) {
    const [inputCount, setInputCount] = useState(1);
    const classes = useStyles();

    const answers = props.state.res.answers;
    if (answers[props.title] === undefined) {
        props.callback({});
    }

    const callback = id => event => {
        answers[props.title][id] = [event.target.value, event.target.value.length];
        if (answers[props.title][id + 1] === undefined) {
            setInputCount(inputCount + 1);
            answers[props.title][id + 1] = "";
        }

        props.callback(answers[props.title]);
    };

    let displayList = generateList(inputCount, callback, props.minWidth, props.disabled);

    return (
        <Box className={classes.root} py={2}>
            {displayList}
        </Box>
    );
}

const generateList = (count, callback, boxWidth, disabled) => {
    let resList = [];

    for (let i = 1; i <= count; i++) {
        resList.push(
            <Box key={i} minWidth={boxWidth}>
                <TextField fullWidth={true} disabled={disabled} placeholder="Enter Answer"  onChange={callback(i)}/>
            </Box>
        );
    }

    return resList;
};

export default UnlimitedAnswer;
