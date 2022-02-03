import React, { Component } from "react";
import Box from "@material-ui/core/Box";

import PropTypes from "prop-types";

import { BrowserRouter, Switch, Redirect, Route, withRouter } from "react-router-dom";

import HomeContent from "../HomeContent";
import AdminContent from "../AdminContent";
import NotFoundContent from "../NotFoundContent";
import QuizContent from "../QuizContent/QuizContent";
import GroupContent from "../GroupContent/GroupContent";
import BlockContent from "../BlockContent/BlockContent";
import BlockPage from "../BlockContent/BlockPage";

class Router extends Component {
  render() {
    // Properties
    const { user, roles, bar } = this.props;

    // Functions
    const { openSnackbar } = this.props;

    return (
      <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
        {bar}

        <Switch>
          <Route path="/" exact>
            <HomeContent user={user} openSnackbar={openSnackbar} />
          </Route>

          <Route path="/admin">
            {user && roles.includes("admin") ? (
              <AdminContent />
            ) : (
              <Redirect to="/" />
            )}
          </Route>

          <Route
            path="/blockGroup"
            render={({ match: { url } }) => (
              <>
                <Route path={`${url}/:block_group`} component={BlockContent} exact />
                <Route path={`${url}/:block_group/block/:block_title`} component={BlockPage} exact/>
                <Route path={`${url}/:block_group/block/:block_title/quizGroup/:group_title`} component={GroupContent} exact />
                <Route path={`${url}/:block_group/block/:block_title/quizGroup/:group_title/quiz/:quiz_title`} component={QuizContent}/>
              </>
            )}
          />

          {/* <Route
            path="/group"
            render={({ match: { url } }) => (
              <>
                <Route path={`${url}/:group_title`} component={GroupContent} exact />
                <Route path={`${url}/:group_title/quiz/:quiz_title`} component={QuizContent}/>
              </>
            )}
          /> */}

          <Route>
            <NotFoundContent />
          </Route>
        </Switch>
      </BrowserRouter>
    );
  }
}

Router.propTypes = {
  // Properties
  user: PropTypes.object,
  roles: PropTypes.array.isRequired,
  bar: PropTypes.element,

  // Functions
  openSnackbar: PropTypes.func.isRequired
};

export default Router;
