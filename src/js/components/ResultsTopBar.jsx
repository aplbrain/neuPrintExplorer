/*
 * Top bar for each query result.
*/

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import DialogContentText from '@material-ui/core/DialogContentText';

import { authError, reAuth } from 'actions/user';
import C from '../reducers/constants';

const styles = () => ({
  root: {
    width: '100%',
    flexGrow: true
  },
  flex: {
    flex: 1
  }
});

class ResultsTopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      bookmarkname: '',
      showQuery: false
    };
  }

  openPopup = () => {
    this.setState({ open: true, bookmarkname: '' });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  addFavorite = () => {
    const { actions, token, appDB, queryStr } = this.props;
    const { bookmarkname } = this.state;
    if (token !== '') {
      const loc = window.location.pathname + window.location.search;
      this.setState({ open: false });

      fetch(`${appDB}/user/favorites`, {
        body: JSON.stringify({
          name: bookmarkname,
          url: loc,
          cypher: queryStr
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json'
        },
        method: 'POST'
      }).then(resp => {
        if (resp.status === 401) {
          // need to re-authenticate
          actions.reAuth();
          actions.authError('User must re-authenticate');
        }
      });
    }
  };

  render() {
    const {
      classes,
      color,
      name,
      index,
      queryStr,
      version,
      downloadCallback,
      actions
    } = this.props;
    const { showQuery, open } = this.state;

    return (
      <div className={classNames(classes.root, 'topresultbar')} style={{ backgroundColor: color }}>
        <Toolbar>
          <Typography variant="caption" color="inherit" className={classes.flex} noWrap>
            {name}
          </Typography>
          <IconButton
            onClick={() => {
              this.setState({ showQuery: true });
            }}
            aria-label="Show Query"
          >
            <Icon style={{ fontSize: 18 }}>info</Icon>
          </IconButton>
          <Dialog
            open={showQuery}
            onClose={() => {
              this.setState({ showQuery: false });
            }}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Neo4j Cypher Query</DialogTitle>
            <DialogContent>
              <DialogContentText>{queryStr}</DialogContentText>
            </DialogContent>
          </Dialog>
          <IconButton aria-label="Add favorite" onClick={this.openPopup}>
            <Icon style={{ fontSize: 18 }}>star</Icon>
          </IconButton>
          <Dialog open={open} onClose={this.handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Save Bookmark</DialogTitle>
            <DialogContent>
              <DialogContentText>Name and save a query.</DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="bookmark name"
                fullWidth
                onChange={event => this.setState({ bookmarkname: event.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={this.addFavorite} color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
          <IconButton
            className={classes.button}
            aria-label="Download data"
            onClick={() => {
              downloadCallback(index);
            }}
          >
            <Icon style={{ fontSize: 18 }}>file_download</Icon>
          </IconButton>
          <IconButton
            className={classes.button}
            aria-label="Close Window"
            onClick={() => {
              if (version === 2) {
                actions.clearNewResult(index);
              } else {
                actions.clearResult(index);
              }
            }}
          >
            <Icon style={{ fontSize: 18 }}>close</Icon>
          </IconButton>
        </Toolbar>
      </div>
    );
  }
}

const ResultsTopBarState = state => ({
  token: state.user.get('token'),
  appDB: state.app.get('appDB')
});

const ResultsTopBarDispatch = dispatch => ({
  actions: {
    reAuth() {
      dispatch(reAuth());
    },
    clearResult(index) {
      dispatch({
        type: C.CLEAR_RESULT,
        index
      });
    },
    authError(message) {
      dispatch(authError(message));
    },
    clearNewResult(index) {
      dispatch({
        type: C.CLEAR_NEW_RESULT,
        index
      });
    }
  }
});

ResultsTopBar.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  color: PropTypes.string,
  downloadCallback: PropTypes.func.isRequired,
  queryStr: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  token: PropTypes.string.isRequired,
  appDB: PropTypes.string.isRequired,
  version: PropTypes.number
};

ResultsTopBar.defaultProps = {
  version: 1,
  color: '#cccccc'
};

export default withStyles(styles)(
  connect(
    ResultsTopBarState,
    ResultsTopBarDispatch
  )(ResultsTopBar)
);