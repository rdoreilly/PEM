import React, { useState, useEffect } from "react";
import { Box, RadioGroup, FormControlLabel, Radio } from "@material-ui/core";

function MultipleChoiceCard(props) {
  let choices = props.element.choices;
  let itemList = generateList(choices, props.disabled);

  if (props.state.res.answers[props.title] === undefined) {
    props.callback(" ");
  }

  return (
    <Box p={1} display="flex" justifyContent="center">
      <RadioGroup
        aria-label="Choices"
        name="choices"
        value={props.state.res.answers[props.title]}
        onChange={setAnswer(props.callback, props.title)}
        row
      >
        {itemList}
      </RadioGroup>
    </Box>
  );
}

const generateList = (choices, disabled) => {
  let keyList = Object.keys(choices);
  let resList = [];
  keyList.forEach(element => {
    resList.push(
      <FormControlLabel
        disabled={disabled}
        key={element}
        value={`${choices[element]}`}
        control={<Radio />}
        label={`${choices[element]}`}
        labelPlacement="top"
      />
    );
  });
  return resList;
};

const setAnswer = (callback, element) => event => {
  let answer = event.target.value;
  callback(answer);
};

export default MultipleChoiceCard;
