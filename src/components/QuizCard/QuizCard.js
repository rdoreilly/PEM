import React from "react";
import { Link } from "react-router-dom";
import { Box, Card, Button } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
  heading: {
    fontSize: theme.typography.pxToRem(16),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }
}));

function QuizCard(props) {
  let {quizTitle, quizGroupTitle, blockTitle, blockGroupTitle} = {...props};
  const classes = useStyles();

  return (
    <Box>
      <Card>
        <Box className={classes.container} py={1.5} px={1.5}>
          <Typography className={classes.heading}>{quizTitle.replace(/_/g, ' ')}</Typography>
          <Box>
            <Button
              color="inherit"
              component={Link}
              disabled={props.disabled}
              to={{
                pathname: `/blockGroup/${blockGroupTitle}/block/${blockTitle}/quizGroup/${quizGroupTitle}/quiz/${quizTitle}`,
                state: {...props}
              }}
              variant="contained"
              size={"medium"}
              color={"primary"}
            >
              {props.text}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}

export default QuizCard;
