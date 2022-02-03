import React, { Component, createRef, useRef } from "react";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import { auth, firestore, storage } from "../../firebase";
import TextField from "@material-ui/core/TextField";

import {
  FormControl,
  FormControlLabel,
  Switch,
  CardMedia,
} from "@material-ui/core";
import MultipleChoiceCard from "../MultipleChoiceCard/MultipleChoiceCard";
import UnlimitedAnswer from "../UnlimitedAnswer/UnlimitedAnswer";
import TimerComponent from "../Timer/Timer";
import Pagination from "@material-ui/lab/Pagination";
import { withRouter } from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import SelectChoiceCard from "../SelectChoiceCard/SelectChoiceCard";
import Divider from "@material-ui/core/Divider";
import RecordRTC from "recordrtc";
import TestVideo from "../TestVideo/TestVideo";
import CustomVideoComponent from "../CustomVideoComponent/CustomVideo";

const boxMinWidth = "650px";

const useStyles = (theme) => ({
  media_container: {
    margin: "auto",
    borderRadius: "5px",
    justifyContent: "start",
  },
  media: {
    width: "100%",
  },
  hidden: {
    display: "none",
  },
  visible: {},
  timer_box: {
    display: "flex",
    columnGap: "1rem",
    rowGap: "1rem",
  },
  anonymousToggle: {
    marginLeft: "5px",
  },
  begin_box: {
    display: "flex",
    justifyContent: "flex-end",
    columnGap: "1rem",
  },
});

var storageRef = storage.ref();

const defaultState = (location_data) => {
  return {
    location_data: location_data,
    anonymous: true,
    res: {
      user: auth.currentUser ? auth.currentUser.email : "",
      answers: {},
    },
    uploadURLS: [],
    recording: null,
    recorder: null,
    records: {},
    data: {},
    started: false,
    hash: "",
    page: 1,
    pageCount: 0,
    startTime: null,
    snackbarOpen: false,
    validation: {},
    groupData: {},
    media_url: null,
    description_recording: true
  };
};

const group = window.location.href.split("/")[4];

class QuizContent extends Component {
  title = "";

  questionsPerPage = 10;

  recorder = null;

  constructor(props) {
    super(props);
    this.state = defaultState(props.location.state);
    this.questionCard = this.questionCard.bind(this);
    this.submit = this.submit.bind(this);
    this.essayType = this.essayType.bind(this);
    this.updateEssayQuestion = this.updateEssayQuestion.bind(this);
    this.setPage = this.setPage.bind(this);
    this.checkAnswers = this.checkAnswers.bind(this);
    this.resetState = this.resetState.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.recordFunction = this.recordFunction.bind(this);
    this.uploadRecording = this.uploadRecording.bind(this);
    this.getTitle = this.getTitle.bind(this);
  }

  getTitle() {
    return this.state.location_data.quizTitle;
  }

  shuffleObject(objectToShuffle) {
    let shuffledObject = this.convertToList(objectToShuffle);
    shuffledObject.sort((a, b) => Math.random());

    return shuffledObject;
  }

  convertToList(objectToConvert) {
    let keys = Object.keys(objectToConvert);
    let convertedList = [];

    keys.forEach((key, index) => {
      objectToConvert[key].number = key;
      convertedList.push(objectToConvert[key]);
    });

    return convertedList;
  }

  stopRecording() {
    let ts = this;
    const tempFunc = async () => {
      await ts.state.recorder.stopRecording(function () {
        let blob = ts.state.recorder.getBlob();

        var records = ts.state.records;
        records[ts.state.recording] = blob;
        ts.setState({ ...ts.state, records: records, recording: null });
      });
    };

    tempFunc();
  }

  recordFunction(questionTitle) {
    this.state.recorder.reset();
    this.state.recorder.startRecording();

    this.setState({ ...this.state, recording: questionTitle });
  }

  componentDidMount() {
    let that = this;
    this.resetState();

    async function recordFunction() {
      await that.recorder.startRecording();
    }

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then(async function (stream) {
        that.setState({
          ...that.state, recorder: RecordRTC(stream, {
            type: "video",
            mimeType: "video/webm",
          })
        });

      });
  }

  resetState() {
    this.setState(defaultState(this.state.location_data));
    this.title = this.getTitle();
    this.title = this.title.replace("%20", " ");
    this.title = this.title.replace(/%20/g, " ");

    const groupDocumentReference = firestore
      .collection("quizGroups")
      .doc(this.state.location_data.quizGroupTitle);
    const quizDocumentsReference = firestore
      .collection("quizs")
      .doc(this.title);

    async function getDetails(thus) {
      const groupDoc = await groupDocumentReference.get();
      const groupData = groupDoc.data();

      if (groupData["results"] === undefined) {
        groupData["results"] = {};
      }

      if (groupData["results"][thus.title] === undefined) {
        groupData["results"][thus.title] = [];
      }

      const quizDoc = await quizDocumentsReference.get();
      const res = quizDoc.data();

      let questionNames = thus.getQuestionNames(res.questions);

      res.questions =
        res.order !== "ordered"
          ? thus.shuffleObject(res.questions)
          : thus.convertToList(res.questions);

      thus.setState({
        ...thus.state,
        data: res,
        validation: questionNames,
        groupData: groupData,
        media_url: res.media_url,
      });
    }

    getDetails(this);
    console.log(`HASH: ${localStorage.getItem("hash")}`);
  }

  getQuestionNames(questionObj) {
    let nameObject = {};

    let keys = Object.keys(questionObj);
    keys.forEach((element) => {
      nameObject[questionObj[element].title] = true;
    });
    return nameObject;
  }

  questionCard(element) {
    const { classes } = this.props;

    const title = element.title;
    let item;
    const type = element.type;

    const callback = (answer) => {
      const tempstate = this.state.res;
      tempstate.answers[title] = answer;

      if (this.state.res.questionCount === undefined) {
        tempstate.questionCount = {};
      }

      if (typeof answer === "object" && Object.keys(answer).length !== 0)
        tempstate.questionCount[title] = "";
      else if (typeof answer != "object" && answer.trim().length !== 0) {
        tempstate.questionCount[title] = "";
      }

      this.setState({ ...this.state, res: tempstate });
    };

    let isDisabled =
      this.state.recording !== null && element.title !== this.state.recording;

    switch (type) {
      case "essay":
        item = this.essayType(title, isDisabled);
        break;
      case "multiple_choice":
        item = (
          <MultipleChoiceCard
            disabled={isDisabled}
            state={this.state}
            setState={this.setState}
            element={element}
            callback={callback}
            title={title}
          />
        );
        break;
      case "select":
        item = (
          <SelectChoiceCard
            disabled={isDisabled}
            state={this.state}
            setState={this.setState}
            element={element}
            callback={callback}
            title={title}
          />
        );
        break;
      case "unlimited":
        item = (
          <UnlimitedAnswer
            disabled={isDisabled}
            minWidth={boxMinWidth}
            state={this.state}
            setState={this.setState}
            element={element}
            callback={callback}
            title={title}
          />
        );
        break;
      default:
        this.essayType(title, isDisabled);
    }

    let cardStyle = this.state.validation[title]
      ? { backgroundColor: "#E8E8E8" }
      : {
        backgroundColor: "#E8E8E8",
        borderColor: "red",
        borderStyle: "solid",
        borderWidth: "2px",
      };

    return (
      <Box marginY={2} key={element.title}>
        <Box margin={2}>
          <Box display="flex" style={{ justifyContent: "space-between" }}>
            <Typography variant="h6" component="h2">
              {element.title}
            </Typography>
            {element.recording && !element.url &&
              <Button style={(this.state.recording !== element.title) ?
                { backgroundColor: "#00e600", color: "white" } :
                { backgroundColor: "#c40000", color: "white" }}
                disabled={(this.state.recording !== null && this.state.recording !== element.title)}
                onClick={(e) => {
                  if (this.state.recording === null)
                    this.recordFunction(element.title);
                  else if (this.state.recording !== null && this.state.recording === element.title)
                    this.stopRecording();
                }}>
                {(this.state.recording !== element.title) ? "Begin Recording" : "Stop Recording"}
              </Button>}
          </Box>
          <Typography style={{ whiteSpace: "pre-wrap" }} component="pre">
            {element.description}
          </Typography>
          <br />
          {(element.content_type && element.content_type.includes("video")) ?
            <div style={{ width: "min-content", borderRadius: "5px", overflow: "hidden", lineHeight: 0 }}>
              <CustomVideoComponent
                recordingEnabled={true}
                mediaURL={element.url}
                record={() => this.recordFunction(element.title)}
                stopRecording={() => this.stopRecording()}
                width={"500px"} />
            </div>
            :
            <Box
              py={2}
              className={classes.media_container}
              display={element.url !== undefined ? "flex" : "none"}
            >
              <Card>
                <CardMedia
                  className={classes.media}
                  component="img"
                  height="auto"
                  image={element.url}
                />
              </Card>
            </Box>
          }
          {item}
        </Box>
      </Box>
    );
  }

  essayType(element, disabled) {
    if (this.state.res.answers[element] === undefined) {
      let tempRes = this.state.res;
      tempRes.answers[element] = "";
      this.setState({ res: tempRes });
    }

    return (
      <Box
        display="flex"
        marginTop={2}
        midWidth={boxMinWidth}
        flexDirection="column"
      >
        <TextField
          disabled={disabled}
          style={{ backgroundColor: "white" }}
          fullWidth={true}
          label="Description"
          onChange={(event) => this.updateEssayQuestion(event, element)}
          variant="outlined"
          multiline
          rows={3}
        />
      </Box>
    );
  }

  updateEssayQuestion(e, element) {
    let answer = e.target.value;
    let tempRes = this.state.res;
    tempRes.answers[element] = [answer, answer.length];

    if (this.state.res.questionCount === undefined) {
      tempRes.questionCount = {};
    }

    tempRes.questionCount[element] = "";

    this.setState({ res: tempRes });
  }

  cleanAnswers(answerObject) {
    let returnObj = {};
    Object.keys(answerObject).forEach((element) => {
      if (answerObject[element] instanceof String) {
        return;
      }

      returnObj[element] = `${JSON.stringify(answerObject[element])}`
        .replace(/,/g, ";")
        .replace(/"/g, "");
    });

    return returnObj;
  }

  checkAnswers() {
    let answers = { ...this.state.res.answers };
    let validation = this.state.validation;
    let allAnswered = true;
    Object.keys(answers).forEach((element) => {
      if (answers[element] instanceof Object) {
        if (Object.keys(answers[element]).length === 0) {
          allAnswered = false;
          validation[element] = false;
        } else {
          validation[element] = true;
        }
      } else if (answers[element].trim().length === 0) {
        allAnswered = false;
        validation[element] = false;
      } else {
        validation[element] = true;
      }
    });
    this.setState({ ...this.state, validation: validation });
    return allAnswered;
  }

  async submit(timeout) {
    if (!timeout) {
      if (!this.checkAnswers()) {
        this.setState({ ...this.state, snackbarOpen: true });
        return;
      }
    }

    const data = this.state.groupData;

    let answers = this.state.res.answers;
    let email = auth.currentUser.email;

    answers = this.cleanAnswers(answers);

    answers["time_taken"] = Math.abs(new Date() - this.state.startTime) / 1000;
    answers["timestamp"] = new Date();

    data.results[this.title].push(answers);

    if (data["users"] === undefined) data["users"] = {};

    if (data["users"][email] === undefined) data["users"][email] = [];

    data["users"][email].push(this.title);

    let hash = localStorage.getItem("hash");
    const quizDocumentReference = firestore.collection("userID").doc(hash);
    let recordingList = await this.uploadRecording(group);

    let snapshot = await quizDocumentReference.get();
    let doc_data = { ...snapshot.data() };

    if (doc_data.results === undefined)
      doc_data.results = {};

    if (doc_data.results[this.state.location_data.blockGroupTitle] === undefined)
      doc_data.results[this.state.location_data.blockGroupTitle] = {};

    if (doc_data.results[this.state.location_data.blockGroupTitle][this.state.location_data.blockTitle] === undefined)
      doc_data.results[this.state.location_data.blockGroupTitle][this.state.location_data.blockTitle] = {};

    if (doc_data.results[this.state.location_data.blockGroupTitle][this.state.location_data.blockTitle][this.state.location_data.quizGroupTitle] === undefined)
      doc_data.results[this.state.location_data.blockGroupTitle][this.state.location_data.blockTitle][this.state.location_data.quizGroupTitle] = {};

    doc_data.results[this.state.location_data.blockGroupTitle][this.state.location_data.blockTitle][this.state.location_data.quizGroupTitle][this.state.location_data.quizTitle] = {
      answers: this.state.res.answers,
      recordURLS: recordingList
    };

    quizDocumentReference
      .update(doc_data)
      .then((value) => {
        alert("Survey Updated");
        this.props.history.push({
          pathname: `/blockGroup/${this.state.location_data.blockGroupTitle}/block/${this.state.location_data.blockTitle}/quizGroup/${this.state.location_data.quizGroupTitle}`,
          state: {
            blockGroupTitle: this.state.location_data.blockGroupTitle,
            blockTitle: this.state.location_data.blockTitle,
            quizGroupTitle: this.state.location_data.quizGroupTitle
          }
        });
        this.resetState();
      })
      .catch((reason) => {
        console.log(`FAIL: ${JSON.stringify(reason, null, 4)}`);
      });
  }

  async uploadRecording(group) {
    let recordings = Object.keys(this.state.records);
    let ts = this;

    let recordingList = [];

    const upload = async () => {
      for (var element of recordings) {
        let uploadURL = `results/${localStorage.getItem('hash')}/${this.state.location_data.blockGroupTitle}/${this.state.location_data.blockTitle}/${this.state.location_data.quizGroupTitle}/${this.state.location_data.quizTitle}/${element}.webm`;
        let ref = storageRef.child(uploadURL);
        let snapshot = await ref.put(ts.state.records[element]);
        let downloadURL = await snapshot.ref.getDownloadURL();
        let entry = {};
        entry[element] = downloadURL;
        recordingList.push(entry);
      }
    }

    await upload();
    return recordingList;
  }

  setPage(event, value) {
    console.log(value);
    this.setState({ ...this.state, page: value });
  }

  render() {
    const { classes } = this.props;

    const questionList = [];
    const questions = this.state.data.questions;

    if (questions !== undefined) {
      let page = [];

      questions.forEach((element) => {
        if (page.length / 2 < this.questionsPerPage) {
          page.push(this.questionCard(element));
          page.push(<Divider />);
        } else {
          questionList.push(page);
          page = [];
          page.push(this.questionCard(element));
        }
      });
      questionList.push(page);
    }

    return (
      <Box>
        <Box
          className={this.state.started ? classes.hidden : classes.visible}
          width={3 / 5}
          mx="auto"
          my={3}
        >
          <Card>
            <Box padding={2}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {this.state.data.title !== undefined && <Typography variant="h5" component="h2">
                  {this.state.data.title.replace(/_/g, ' ')}
                </Typography>}
                {this.state.description_recording &&
                  <div style={{ display: "flex", columnCount: 2, columnGap: "10px" }}>
                    <TestVideo />
                    {(this.state.media_url == null || this.state.media_url == undefined) &&
                      <Button style={(this.state.recording !== "description") ?
                        { backgroundColor: "#00e600", color: "white" } :
                        { backgroundColor: "#c40000", color: "white" }}
                        disabled={(this.state.recording !== null && this.state.recording !== "description")}
                        onClick={(e) => {
                          if (this.state.recording === null)
                            this.recordFunction("description");
                          else if (this.state.recording !== null && this.state.recording === "description")
                            this.stopRecording();
                        }}>
                        {(this.state.recording !== "description") ? "Begin Recording" : "Stop Recording"}
                      </Button>}
                  </div>
                }
              </div>
              <Typography
                variant="body1"
                component="pre"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {this.state.data.description}
              </Typography>
              {(this.state.media_url != undefined) &&
                <div>
                  <br />
                  <CustomVideoComponent
                    recordingEnabled={true}
                    mediaURL={this.state.media_url}
                    record={() => this.recordFunction("description")}
                    stopRecording={() => this.stopRecording()}
                    width={"100%"} />
                </div>

              }
              <Box className={classes.begin_box} marginTop={2}>
                <Button
                  variant="contained"
                  disabled={auth.currentUser === null}
                  onClick={() => {
                    this.setState({
                      ...this.state,
                      started: true,
                      startTime: new Date(),
                    });
                  }}
                >
                  {auth.currentUser === null ? "Sign in to continue " : "Begin"}
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
        <Box
          className={!this.state.started ? classes.hidden : classes.visible}
          display="flex"
          justifyContent="center"
          width="95%"
          mx="auto"
          my={3}
        >
          <Card>
            <Box padding={2}>
              <Box className={classes.timer_box}>
                <Typography variant="h5" component="h2">
                  Questions
                </Typography>
                {this.state.data.time_limit_enabled === "enabled" && (
                  <TimerComponent
                    timeoutFunc={this.submit}
                    startTime={this.state.data.time}
                    started={this.state.started}
                  />
                )}
                <Typography variant="h5" component="h2">
                  {this.state.res.questionCount
                    ? Object.keys(this.state.res.questionCount).length
                    : 0}{" "}
                  /{" "}
                  {this.state.data.questions
                    ? Object.keys(this.state.data.questions).length
                    : 0}
                </Typography>
              </Box>
              <FormControl>{questionList[this.state.page - 1]}</FormControl>
            </Box>
            <Box display="flex" justifyContent="center">
              <Pagination
                count={questionList.length}
                onChange={this.setPage}
                color="primary"
              />
            </Box>
            <Box padding={2} display="flex" justifyContent="end">
              <Button onClick={() => this.submit(false)} variant="outlined">
                Submit
              </Button>
            </Box>
          </Card>
        </Box>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          open={this.state.snackbarOpen}
          autoHideDuration={7000}
          onClose={() => {
            this.setState({ ...this.state, snackbarOpen: false });
          }}
        >
          <MuiAlert elevation={6} variant="filled" severity="error">
            You have unanswered questions
          </MuiAlert>
        </Snackbar>
      </Box>
    );
  }
}

export default withStyles(useStyles)(withRouter(QuizContent));
