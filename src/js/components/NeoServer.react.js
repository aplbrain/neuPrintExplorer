/*
 * Handle neo4j server information.
*/

"use strict";

import React from 'React';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Icon from 'material-ui/Icon';
import Badge from 'material-ui/Badge';
import PropTypes from 'prop-types';

import {withStyles} from 'material-ui/styles';
import Dialog, {
  DialogActions,
  DialogContent,
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
            user: "neo4j",
            password: "neo4j",
            datasets: [],
            rois: [],
            open: false
        };

        fetch('/neo4jconfig')
            .then(result=>result.json())
            .then(items=> {
                let servername = this.state.neoServer;
                let datasets = this.state.datasets;
                let user = this.state.user;
                let password = this.state.password;
                let rois = this.state.rois;
                for (var item in items) {
                    servername = items[item].server
                    datasets = items[item].datasets;
                    user = items[item].user;
                    password = items[item].password;
                    rois = items[item].rois;
                    if ("default" in items[item] && items[item].default) {
                        break;
                    }
                }
                this.setState({
                        neoServer: servername,
                        datasets: datasets,
                        user: user,
                        password: password,
                        rois: rois,
                    }
                );
                if (servername != "") {
                    this.props.setNeoServer(servername, datasets, rois, user, password);
                }
            });
    }

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    // just use default user and password for now
    // TODO: add custom user/password interface
    handleSave = () => {
        this.setState({ open: false, rois: [], datasets: [], user: "neo4j", password: "neo4j"});
        this.props.setNeoServer(this.state.neoServer, [], [], "neo4j", "neo4j");
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
                            badgeContent={"!"}
                            className={classes.badge}
                    >
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
                        <Button 
                                onClick={this.handleSave}
                                color="primary"
                        >
                            Save 
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

NeoServer.propTypes = {
    classes: PropTypes.object.isRequired,
    setNeoServer: PropTypes.func.isRequired,
    neoServer: PropTypes.string.isRequired,
};



var NeoServerState = function(state) {
    return {
        neoServer: state.neo4jsettings.neoServer,
    }
}

var NeoServerDispatch = function(dispatch) {
    return {
        setNeoServer: function(servername, datasets, rois, user, password) {
            dispatch({
                type: 'SET_NEO_SERVER',
                neoServer: servername,
                availableDatasets: datasets,
                availableROIs: rois,
                user: user,
                password: password,
            });
        }
    }
}

export default withStyles(styles)(connect(NeoServerState, NeoServerDispatch)(NeoServer));

