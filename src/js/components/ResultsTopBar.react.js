/*
 * Top bar for each query result.
*/

import React from 'react';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';
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
import PropTypes from 'prop-types';
import classNames from 'classnames';
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
    if (this.props.token !== '') {
      var loc = window.location.pathname + window.location.search;
      this.setState({ open: false });

      return fetch(this.props.appDB + '/user/favorites', {
        body: JSON.stringify({
          name: this.state.bookmarkname,
          url: loc,
          cypher: this.props.queryStr
        }),
        headers: {
          Authorization: 'Bearer ' + this.props.token,
          'content-type': 'application/json'
        },
        method: 'POST'
      }).then(resp => {
        if (resp.status === 401) {
          // need to re-authenticate
          this.props.reAuth();
          alert('User must re-authenticate');
        }
      });
    }
  };

  render() {
    const { classes, color, name, index, queryStr, version } = this.props;

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
            open={this.state.showQuery}
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
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
          >
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
              this.props.downloadCallback(index);
            }}
          >
            <Icon style={{ fontSize: 18 }}>file_download</Icon>
          </IconButton>
          <IconButton
            className={classes.button}
            aria-label="Close Window"
            onClick={() => {
              if (version === 2) {
                this.props.clearNewResult(index);
              } else {
                this.props.clearResult(index);
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

var ResultsTopBarState = function(state) {
  return {
    token: state.user.get('token'),
    appDB: state.app.get('appDB')
  };
};

var ResultsTopBarDispatch = function(dispatch) {
  return {
    reAuth: function() {
      dispatch({
        type: C.LOGOUT_USER
      });
    },
    clearResult: function(index) {
      dispatch({
        type: C.CLEAR_RESULT,
        index: index
      });
    },
    clearNewResult: function(index) {
      dispatch({
        type: C.CLEAR_NEW_RESULT,
        index
      });
    }
  };
};

ResultsTopBar.propTypes = {
  classes: PropTypes.object.isRequired,
  reAuth: PropTypes.func.isRequired,
  clearResult: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
  downloadCallback: PropTypes.func.isRequired,
  queryStr: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  token: PropTypes.string,
  appDB: PropTypes.string,
  version: PropTypes.number
};

ResultsTopBar.defaultProps = {
  version: 1
};

export default withStyles(styles)(
  connect(
    ResultsTopBarState,
    ResultsTopBarDispatch
  )(ResultsTopBar)
);
