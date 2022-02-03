import React, {useEffect, useState} from 'react';
import {firestore} from "../../firebase";
import CreatedSurvey from "../CreatedSurvey/CreatedSurvey";
import Box from "@material-ui/core/Box";

function CreateQuizTab(props) {
    const quizDocumentsReference = firestore.collection("quizs");

    const [state, setState] = useState({
        quizList: [],
        quizNames: []
    });

    const callback = () => {
        getDocs().then(() => {});
    }

    async function getDocs() {
        let resList = [];
        let quizNames = [];

        let querySnapshot = await quizDocumentsReference.get();

        querySnapshot.forEach(doc => {
            quizNames.push(doc.data().title);

            resList.push(
                <CreatedSurvey
                    callback={callback}
                    quizList={quizNames}
                    update={true}
                    key={doc.id}
                    title={doc.data().title}
                    id={doc.id}
                    description={doc.data().description}
                    order={doc.data().order}
                    time_limit_enabled={doc.data().time_limit_enabled}
                    time={doc.data().time}
                    questions={doc.data().questions}
                    answers={doc.data().answers}
                    linkTo={(doc.data().linkTo !== undefined) ? doc.data().linkTo : "none"}
                />
            );
            resList.push(<Box my={2}/>)
        });
        setState({quizList: resList, quizNames: quizNames});
    }

    useEffect(() => {
        getDocs();
    }, []);

    return (
        <div>
            <CreatedSurvey callback={callback} linkTo={"none"} quizList={state.quizNames} update={false}/>
            <Box my={2}/>
            {state.quizList}
        </div>
    );
}

export default CreateQuizTab;