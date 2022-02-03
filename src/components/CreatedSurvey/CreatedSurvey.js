import React from "react";
import CsvDownload from 'react-json-to-csv'
import {
    Box,
    Button,
    Card,
    Divider,
    Accordion,
    AccordionSummary,
    FormControl,
    FormControlLabel,
    FormLabel,
    Input,
    InputLabel,
    makeStyles,
    Radio,
    RadioGroup,
    TextField,
    Typography, FormHelperText
} from "@material-ui/core";
import firebase, { firestore } from "../../firebase";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Switch from "@material-ui/core/Switch";
import FormGroup from "@material-ui/core/FormGroup";
import IconButton from "@material-ui/core/IconButton";
import { Add, AddCircleOutlineRounded, Backspace, PermMedia, PhotoLibrary, Publish } from "@material-ui/icons";
import Avatar from "@material-ui/core/Avatar";
import blue from "@material-ui/core/colors/blue";
import { blueGrey, grey } from "@material-ui/core/colors";
import { DeleteOutline } from "mdi-material-ui";
import red from "@material-ui/core/colors/red";
import MenuItem from "@material-ui/core/MenuItem";
import ChoiceSelectList from "../ChoiceSelectList/ChoiceSelectList";

const ref = firebase.storage().ref();

const useStyles = makeStyles(theme => ({
    questionList: {
        maxWidth: "200px",
        minWidth: "100px",
        display: "flex",
        flexDirection: "column",
        overflowY: "scroll",
        maxHeight: "550px",
    },
    listText: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        padding: "0.5rem 1rem 0.5rem 1rem",
    },
    selectedListItem: {
        backgroundColor: blueGrey[200],
        color: "white",
        cursor: "pointer"
    },
    unselectedItem: {
        cursor: "pointer"
    },
    questionWrap: {
        padding: "1.5rem"
    },
    questionContainer: {
        display: "flex",
        borderWidth: "1px",
        borderColor: "#c4c4c4",
        borderStyle: "solid",
        borderRadius: "5px",
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    iconAdd: {
        backgroundColor: blue[500],
    },
    deleteIcon: {
        backgroundColor: red[600]
    },
    disabledIcon: {
        backgroundColor: grey[500]
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    paper: {
        position: "absolute",
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: "2px solid #000",
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3)
    },
    bullet: {
        display: "inline-block",
        margin: "0 2px",
        transform: "scale(0.8)"
    },
    questionBox: {
        padding: "1.5rem"
    },
    title: {
        fontSize: 14
    },
    pos: {
        marginBottom: 12
    },
    button_box: {
        [theme.breakpoints.down("sm")]: {
            left: "65%"
        },
        [theme.breakpoints.down("xs")]: {
            left: "60%"
        }
    },
    button_box_edit: {
        float: "right",
        margin: "5px"
    },
    survey_create_container: {
        marginLeft: "15px",
        [theme.breakpoints.down("sm")]: {
            justifyContent: "center",
            marginLeft: "0%"
        }
    },
    formElement: {
        marginTop: "10px",
        marginBottom: "10px"
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
    deleteQuestion: {
        display: "flex",
        flexDirection: "row-reverse",
        width: "100%",
        margin: "10px 10px 10px -10px"
    }
}));

function convertObjToArray(object) {
    let ret = [];

    Object.keys(object).forEach(e => {
        ret.push(object[e]);
    });

    return ret;
}

function earliestIndex(object) {
    return Object.keys(object)[0]
}

function CreatedSurvey(props) {
    const defaultState = () => {
        return {
            title: props.update ? props.title : "",
            original_title: props.update ? props.title : "",
            description: props.update ? props.description : "",
            order: props.update ? props.order : "ordered",
            time_limit_enabled: props.update ? props.time_limit_enabled : "disabled",
            time: props.update ? props.time : [0, 0],
            questions: props.update ? props.questions : {},
            update: props.update,
            linkTo: props.linkTo,
            selectedListItem: props.update && props.questions[0] != undefined ? props.questions[0].title : "none",
            media: null,
            media_type: null,
            media_url: null
        }
    }

    const [state, setContent] = React.useState(defaultState);
    const classes = useStyles();

    const updateQuestion = (question, prop) => event => {
        let questions = state.questions;
        questions[question][prop] = event.target.value;
        setContent({ ...state, questions: questions });
    };

    const updateChecked = (question, prop) => event => {
        let questions = state.questions;
        questions[question][prop] = event.target.checked;
        setContent({ ...state, questions: questions });
    };

    const setImage = question => event => {
        let questions = state.questions;
        let media = event.target.files[0];
        questions[question]["image"] = media;
        questions[question]["content_type"] = media.type;
        setContent({ ...state, questions: questions });
    };

    const setImageGlobal = event => {
        let media = event.target.files[0];
        setContent({ ...state, media: media, media_type: media.type });
    };

    const deleteChoice = (question, choice) => event => {
        let questions = state.questions;

        delete questions[question].choices[choice];
        setContent({ ...state, questions: questions });
    };

    const addChoice = question => event => {
        let length = Object.keys(state.questions[question]["choices"]).length;
        let questions = state.questions;
        questions[question].choices[length] = "Enter Text";
        setContent({ ...state, questions: questions });
    };

    const deleteQuestion = question => event => {
        let questions = state.questions;
        delete questions[question];
        questions.length = questions.length - 1;
        setContent({ ...state, questions: questions });
    };

    const questionCard = question => {
        let elementQuestion = state.questions[question];
        let isMultipleChoice = (elementQuestion.type === "multiple_choice" || elementQuestion.type === "select");

        const updateChoice = (value) => {
            let questions = state.questions;
            let index = (questions[question].selectedItemIndex === undefined) ? 0 : questions[question].selectedItemIndex;

            questions[question]["choices"][index] = value;
            setContent({ ...state, questions: questions });
        };

        const setItem = (value) => {
            let questions = { ...state.questions };

            if (elementQuestion["selectedItem"] === undefined)
                questions[question]["selectedItem"] = ""

            if (elementQuestion["selectedItemIndex"] === undefined)
                questions[question]["selectedItemIndex"] = 0;

            let setval = 0;
            let index = 0;
            Object.keys(elementQuestion["choices"]).forEach((element, i) => {
                if (elementQuestion["choices"][element] === value) {
                    setval = element;
                    index = i;
                }
            });

            questions[question]["selectedItem"] = setval;
            questions[question]["selectedItemIndex"] = index;

            setContent({ ...state, questions: questions });
        }

        const parseFile = async event => {
            event.preventDefault()
            const reader = new FileReader()
            reader.onload = async (e) => {
                const text = (e.target.result);
                let choices = text.split("\n");
                let questions = { ...state.questions };

                choices.forEach(element => {
                    let length = Object.keys(questions[question]["choices"]).length;
                    questions[question].choices[length] = element;
                });

                setContent({ ...state, questions: questions });
            };
            reader.readAsText(event.target.files[0]);
        }

        return (
            <Box key={question} className={classes.questionBox}>
                <Box display="flex" flexDirection="column">
                    <TextField
                        label="Question Title"
                        variant="outlined"
                        style={{ backgroundColor: "white" }}
                        defaultValue={
                            state.questions[question].title
                        }
                        onChange={(e) => {
                            let questions = state.questions;
                            questions[question]["title"] = e.target.value;
                            setContent({ ...state, questions: questions, selectedListItem: e.target.value });
                        }}
                        className={classes.formElement}
                    />
                    <Box display="flex" flexDirection="column" marginY={1}>
                        <TextField
                            style={{ backgroundColor: "white" }}
                            label="Description"
                            onChange={updateQuestion(question, "description")}
                            defaultValue={
                                state.update ? state.questions[question].description : null
                            }
                            variant="outlined"
                            multiline
                            rows={3}
                        />
                    </Box>
                    <Box className={classes.upload_image_row} display="flex" py={2}>
                        <Avatar className={classes.iconAdd}>
                            <IconButton style={{ color: "white" }} component="label">
                                <PermMedia />
                                <input
                                    onChange={setImage(question)}
                                    accept="image/*,video/*"
                                    type="file"
                                    style={{ display: "none" }}
                                />
                            </IconButton>
                        </Avatar>
                        <Typography variant="body1">
                            {state.questions[question].image !== undefined
                                ? state.questions[question].image.name
                                : "No media chosen"}
                        </Typography>
                    </Box>
                    <Box>
                        <FormLabel>Recording Enabled</FormLabel>
                        <Switch checked={state.questions[question].recording} onChange={updateChecked(question, "recording")} />
                    </Box>
                    <Box>
                        <FormLabel>Question Type</FormLabel>
                        <RadioGroup
                            defaultValue={
                                state.update ? state.questions[question].type : null
                            }
                            aria-label="ordered"
                            onChange={updateQuestion(question, "type")}
                            row
                        >
                            <FormControlLabel
                                value="essay"
                                control={<Radio />}
                                label="Essay"
                            />
                            <FormControlLabel
                                value="unlimited"
                                control={<Radio />}
                                label="Unlimited Answers"
                            />
                            <FormControlLabel
                                value="multiple_choice"
                                control={<Radio />}
                                label="Multiple Choice"
                            />
                            <FormControlLabel
                                value="select"
                                control={<Radio />}
                                label="Select"
                            />

                            <Avatar className={isMultipleChoice ? classes.iconAdd : classes.disabledIcon}>
                                <IconButton component={"label"} disableRipple={!isMultipleChoice}
                                    disabled={!isMultipleChoice} style={{ color: "white" }}
                                    onClick={addChoice(question)}>
                                    <Publish />
                                    <input
                                        type="file"
                                        onChange={(e) => parseFile(e)}
                                        style={{ display: "none" }}
                                    />
                                </IconButton>
                            </Avatar>
                        </RadioGroup>
                        {isMultipleChoice &&
                            <ChoiceSelectList items={convertObjToArray(elementQuestion["choices"])} setItem={(value) => setItem(value)} callback={updateChoice}
                                addChoice={addChoice(question)}
                                selectedItem={elementQuestion["selectedItem"] === undefined ? elementQuestion["choices"][earliestIndex(elementQuestion["choices"])] : elementQuestion["choices"][elementQuestion["selectedItem"]]} />}
                    </Box>
                </Box>
                <Box className={classes.deleteQuestion}>
                    <Button onClick={deleteQuestion(question)} variant="outlined">
                        Delete
                    </Button>
                </Box>
            </Box>
        );
    };

    let questionsDisplay = {};

    Object.keys(state.questions).forEach((element, index) => {
        questionsDisplay[state.questions[element].title] = questionCard(element, index);
    });

    const addNewQuestion = () => {
        let size = Object.keys(state.questions).length;
        let questions = state.questions;
        questions[size] = {
            title: "Temporary Title",
            description: "",
            type: "essay",
            choices: {},
            selectedItem: "",
            selectedItemIndex: 0,
            recording: false
        };

        setContent({ ...state, questions: questions, selectedListItem: questions[size].title });
    };

    const deleteSurvey = callback => event => {
        const quizDocumentReference = firestore
            .collection("quizs")
            .doc(state.title);

        quizDocumentReference
            .delete()
            .then(value => {
                alert("Survey Deleted");
                callback();
            })
            .catch(reason => {
                console.log(`FAIL: ${JSON.stringify(reason, null, 4)}`);
            });
    };

    const resetState = () => {
        props.callback();
        if (!props.update)
            setContent(defaultState());
    }

    const handleChange = prop => event => {
        setContent({ ...state, [prop]: event.target.value });
    };

    const setTime = props => event => {
        let newTime = state.time;
        newTime[props] = event.target.value;
        setContent({ ...state, time: newTime });
    };

    return (
        <Box>
            <Card>
                <Accordion TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography className={classes.heading}>
                            {state.update ? "Edit" : "Create"}
                        </Typography>
                        {state.update && <Typography className={classes.secondaryHeading}>
                            {state.title}
                        </Typography>}
                    </AccordionSummary>
                    <Box display="flex" className={classes.survey_create_container}>
                        <FormControl mx="auto">
                            <TextField
                                className={classes.formElement}
                                onChange={handleChange("title")}
                                variant={"outlined"}
                                size={"small"}
                                label={"Title"}
                                id="title"
                                defaultValue={state.update ? state.title : null}
                            />
                            <TextField
                                multiline
                                id="description"
                                label="Survey Description"
                                placeholder="Please enter description"
                                variant="outlined"
                                rows={4}
                                onChange={handleChange("description")}
                                className={classes.formElement}
                                defaultValue={state.update ? state.description : null}
                            />
                            <Box className={classes.upload_image_row} display="flex" py={2}>
                                <Avatar className={classes.iconAdd}>
                                    <IconButton style={{ color: "white" }} component="label">
                                        <PermMedia />
                                        <input
                                            onChange={setImageGlobal}
                                            accept="image/*,video/*"
                                            type="file"
                                            style={{ display: "none" }}
                                        />
                                    </IconButton>
                                </Avatar>
                                <Typography variant="body1">
                                    {state.media != undefined
                                        ? state.media.name
                                        : "No media chosen"}
                                </Typography>
                            </Box>
                            <Box marginY={2}>
                                <FormGroup row>
                                    <FormControlLabel
                                        control={<Switch checked={(state.order !== "ordered")} onClick={() => {
                                            setContent({
                                                ...state,
                                                order: (state.order === "ordered") ? "random" : "ordered"
                                            })
                                        }} name="Randomise Question Order" />}
                                        label="Randomise Question Order"
                                    />
                                    <FormControlLabel
                                        control={<Switch checked={(state.time_limit_enabled === "enabled")}
                                            onClick={() => {
                                                setContent({
                                                    ...state,
                                                    time_limit_enabled: (state.time_limit_enabled === "enabled") ? "disabled" : "enabled"
                                                })
                                            }} name="Enable Time Limit" />}
                                        label="Enable Time Limit"
                                    />
                                </FormGroup>
                            </Box>
                            <Box marginY={1}>
                                <FormLabel component="legend">Time Limit (mm:ss)</FormLabel>
                                <Box>
                                    <Input
                                        style={{
                                            width: "5rem",
                                            marginRight: "0.5rem"
                                        }}
                                        maxLength="2"
                                        type="number"
                                        className={classes.formElement}
                                        defaultValue={state.time[0]}
                                        disabled={state.time_limit_enabled === "disabled"}
                                        onInput={e => {
                                            if (e.target.value < 0) e.target.value = 0;
                                        }}
                                        onChange={setTime(0)}
                                    />

                                    <Input
                                        style={{ width: "5rem" }}
                                        type="number"
                                        maxLength="2"
                                        className={classes.formElement}
                                        disabled={state.time_limit_enabled === "disabled"}
                                        defaultValue={state.time[1]}
                                        onInput={e => {
                                            if (e.target.value > 60) e.target.value = 60;
                                            if (e.target.value < 0) e.target.value = 0;
                                        }}
                                        onChange={setTime(1)}
                                    />
                                </Box>
                            </Box>
                            <div>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center"
                                    }}
                                >
                                    <h2>Questions</h2>
                                    <Box marginLeft={2}>
                                        <Avatar className={classes.iconAdd} color={"primary"}>
                                            <IconButton style={{ color: "white" }} onClick={addNewQuestion}>
                                                <Add />
                                            </IconButton>
                                        </Avatar>
                                    </Box>
                                </div>
                                <div className={classes.questionContainer}>
                                    <Box className={classes.questionList}>
                                        {Object.keys(state.questions).map(element => {
                                            let title = state.questions[element].title;
                                            return <Box
                                                className={state.selectedListItem === title ? classes.selectedListItem : classes.unselectedItem}
                                                onClick={() => setContent({
                                                    ...state,
                                                    selectedListItem: title
                                                })} key={element}>
                                                <Typography className={classes.listText}>{title}</Typography>
                                            </Box>
                                        }
                                        )}
                                    </Box>
                                    <Box w={"1px"}><Divider style={{ width: "1px", height: "100%" }}
                                        orientation={"vertical"} /></Box>
                                    {questionsDisplay[state.selectedListItem]}
                                </div>
                            </div>
                        </FormControl>
                    </Box>
                    <br />
                    <Divider />
                    <Box
                        className={classes.button_box_edit}
                    >
                        <Box display="flex" flexDirection="row">
                            {state.update ? (
                                <Button size="medium" onClick={deleteSurvey(resetState)}>
                                    Delete
                                </Button>
                            ) : null}
                            <Button size="medium" onClick={updateSurvey(state, resetState)}>
                                {state.update ? "Update" : "Create"}
                            </Button>
                            {(props.answers) && <CsvDownload data={props.answers} />}
                        </Box>
                    </Box>
                </Accordion>
            </Card>
        </Box>
    );
}

const updateSurvey = (state, callback) => async event => {
    const item = state;

    if (item.time_limit_enabled === "disabled") {
        item.time = [0, 0];
    }

    const keyList = Object.keys(state.questions);

    for (const element of keyList)
        item.questions[element] = await submitFile(item.questions[element]);

    let url = await submitMedia(item);
    item["media"] = null;
    item["media_url"] = url;

    await submitQuiz(item, callback);
};

async function submitMedia(state){
    let url = null;
    if(state.media != undefined){
        let location = (state.media.type.includes("video")) ? "quizImages/" + new Date() + "-" + state.media.name : "quizVideos/" + state.media.name;
        let mediaRef = ref.child(location);
        let metadata = {
            contentType: state.media.type
        };
        let snapshotRef = await mediaRef.put(state.media, metadata);

        url = await snapshotRef.ref.getDownloadURL();
    }

    return url;
}

async function submitFile(question) {
    if (question.image !== undefined) {
        let location = (question.image.type.includes("video")) ? "quizImages/" + new Date() + "-" + question.image.name : "quizVideos/" + question.image.name;
        let imageRef = ref.child(location);
        let metadata = {
            contentType: question.image.type
        };

        let snapshotRef = await imageRef.put(question.image, metadata);
        question.url = await snapshotRef.ref.getDownloadURL();
        delete question.image;

        return question;
    }

    return question;
}

async function submitQuiz(tempValues, callback) {
    let quizDocumentReference = firestore
        .collection("quizs")
        .doc(tempValues["title"]);


    try {
        await quizDocumentReference.set(tempValues);
        if (tempValues.original_title !== tempValues.title && tempValues.original_title.length > 0) {
            let oldQuizDocumentReference = firestore.collection("quizs").doc(tempValues.original_title);
            await oldQuizDocumentReference.delete();
        }
        ;
        callback();
        alert("Survey Updated");
    } catch (err) {
        console.log(err);
        console.log(`FAIL: ${JSON.stringify(tempValues, null, 4)}`);
    }
}

export default CreatedSurvey;
