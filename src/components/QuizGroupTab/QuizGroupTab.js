import React, {useEffect, useState} from 'react';
import QuizGroupPane from "../QuizGroupPane/QuizGroupPane";
import {firestore} from "../../firebase";
import {makeStyles} from "@material-ui/styles";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles({
    groupList: {
        display: "flex",
        flexDirection: "column",
        rowGap: "1rem"
    }
});

function QuizGroupTab(props) {
    const quizGroupCollection = firestore.collection("quizGroups");
    const classes = useStyles();

    const [displayList, setList] = useState([]);
    const callback = () => {
        getGroups().then(() => {});
    }

    async function getGroups() {
        let groupList = [];
        let querySnapshot = await quizGroupCollection.get();

        querySnapshot.forEach(doc => {
            let data = doc.data();

            groupList.push(<QuizGroupPane
                key={data.title}
                update={true}
                title={data.title}
                description={data.description}
                results={data.results}
                users={data.users}
                links={data.links}
                content={data.content}
                callback={callback}
                video_name={data.video_name}
            />);
        });

        setList(groupList);
    }

    useEffect(() => {
        getGroups().then(() => {});
    }, []);

    return (
        <Box className={classes.groupList}>
            <QuizGroupPane callback={callback} update={false}/>
            {displayList}
        </Box>
    );
}

export default QuizGroupTab;