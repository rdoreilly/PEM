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

function BlockGroupCard(props) {
  let {title, group, block} = {...props};
  const classes = useStyles();

  return (
    <Box>
      <Card>
        <Box className={classes.container} py={1.5} px={1.5}>
          <Typography className={classes.heading}>{title}</Typography>
          <Box>
            <Button
              color="inherit"
              component={Link}
              disabled={props.disabled}
              to={{
                  pathname: `/blockGroup/${group}/block/${title}`,
                  state: { blockGroupTitle: group, blockTitle: block.title}
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

export default BlockGroupCard;
