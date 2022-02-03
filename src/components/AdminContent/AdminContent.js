import React, {Component, useState} from "react";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Box from "@material-ui/core/Box";
import {Divider} from "@material-ui/core";
import CreateQuizTab from "../CreateQuizTab/CreateQuizTab";
import QuizGroupTab from "../QuizGroupTab/QuizGroupTab";
import BlockGroupTab from "../BlockGroupTab/BlockGroupTab";


class AdminContent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            tab: 0
        }
    }

    componentDidMount() {

    }

    render() {
        return (
            <Box m={3}>
                <ButtonGroup variant="contained" color="primary">
                    <Button onClick={() => this.setState({tab: 0})}>Block Editor</Button>
                    <Button onClick={() => this.setState({tab: 1})}>Quiz Group Editor</Button>
                    <Button onClick={() => this.setState({tab: 2})}>Quiz Editor</Button>
                </ButtonGroup>
                <Box my={3}>
                    <Divider/>
                </Box>
                { this.state.tab === 0 && <BlockGroupTab />}
                { this.state.tab === 1 && <QuizGroupTab />}
                { this.state.tab === 2 && <CreateQuizTab />}
            </Box>
        );
    }
}


export default AdminContent;
