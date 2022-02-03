import React, { useState } from "react";
import { Paper, Box, Typography, makeStyles } from "@material-ui/core";
import Timer from "react-compound-timer";

const useStyles = makeStyles({
  text_box: {
    borderRadius: "5px"
  }
});

function TimerComponent(props) {
  const classes = useStyles();
  const [timerStart, setTimerStart] = useState(false);

  return (
    <Box className={classes.text_box}>
      <Paper className={classes.text_box}>
        <Timer
          initialTime={props.startTime[0] * 60000 + props.startTime[1] * 1000}
          direction="backward"
          startImmediately={false}
          checkpoints={[
            {
              time: 0,
              callback: () => {
                props.timeoutFunc(true)
              }
            }
          ]}
        >
          {({ start, resume, pause, stop, reset, timerState }) => {
            if (props.started && !timerStart) {
              start();
              setTimerStart(true);
            }

            return (
              <React.Fragment>
                <Box
                  className={classes.text_box}
                  px={1}
                  py={0.1}
                  color="white"
                  bgcolor="text.disabled"
                >
                  <Typography variant="h6">
                    <Timer.Minutes />
                    :
                    <Timer.Seconds />
                  </Typography>
                </Box>
              </React.Fragment>
            );
          }}
        </Timer>
      </Paper>
    </Box>
  );
}

export default TimerComponent;
