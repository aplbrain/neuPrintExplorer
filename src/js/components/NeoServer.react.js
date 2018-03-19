/*
 * Handle neo4j server information.
*/

"use strict";

import React from 'React';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import SettingsIcon from 'material-ui-icons/Settings';
import IconButton from 'material-ui/IconButton';
import Icon from 'material-ui/Icon';
import Warning from 'material-ui-icons/Warning';
import Badge from 'material-ui/Badge';


import {withStyles} from 'material-ui/styles';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';

const styles = theme => ({
    buttonAlign: {
    },
    badge: {
        margin: 0,
    },
    badgeIcon: {
        fontWeight: "bolder",
        width: "18px",
        height: "18px",
        right: "18px",
        top: "-4px",
    },
    padding: {
        padding: `0 ${theme.spacing.unit * 2}px`,
    },
    settingsIcon: {
        color: "white",
    }
});


class NeoServer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            neoServer: "",
            open: false
        };

        fetch('/neo4jconfig')
            .then(result=>result.json())
            .then(items=> {
                var servername = this.state.neoServer;
                for (var item in items) {
                    servername = items[item].server
                    if ("default" in items[item] && items[item].default) {
                        break;
                    }
                }
                this.setState({
                        neoServer: servername 
                    }
                );
                if (servername != "") {
                    this.props.setNeoServer(servername);
                }
            });
    }

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleSave = () => {
        this.setState({ open: false });
        this.props.setNeoServer(this.state.neoServer);
    };

    render () {
        const { classes } = this.props;
        var defaultserver = this.state.neoServer;
        if (this.props.neoServer !== "") {
            defaultserver = this.props.neoServer;
        }

        //<Button className={classes.buttonAlign} color="inherit" onClick={this.handleClickOpen}>Connect</Button>
        return (
            <div>
                {this.props.neoServer === "" ? 
                    (
                    <Badge color="error"
                            classes={{badge: classes.badgeIcon}}
                            badgeContent={"!"} className={classes.badge}>
                        <Button className={classes.padding}
                                aria-label="Settings"
                                onClick={this.handleClickOpen}>
                            <Icon className={classes.settingsIcon}>settings</Icon>
                        </Button>
                    </Badge>
                    ) : 
                    (
                    <Button className={classes.padding}
                            aria-label="Settings"
                            onClick={this.handleClickOpen}>
                        <Icon className={classes.settingsIcon}>settings</Icon>
                    </Button>)
                }
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">
                        Neo4j Connection Settings
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Server"
                            defaultValue={defaultserver}
                            onChange={(event) => this.setState({neoServer: event.target.value})}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleSave} color="primary">
                            Save 
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

var NeoServerState = function(state) {
    return {
        neoServer: state.neoServer,
    }
}

var NeoServerDispatch = function(dispatch) {
    return {
        setNeoServer: function(servername) {
            dispatch({
                type: 'SET_NEO_SERVER',
                neoServer: servername
            });
        }
    }
}

export default withStyles(styles)(connect(NeoServerState, NeoServerDispatch)(NeoServer));
