/*
 * Main page holding query selector and query forms.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import QueryForm from './QueryForm.react';

import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';
import { LoadQueryString, SaveQueryString, RemoveQueryString } from '../helpers/qsparser';
import Chip from '@material-ui/core/Chip';
import { setUrlQS } from '../actions/app';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 3
  },
  divider: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  chip: {
    margin: theme.spacing.unit / 4
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
    maxWidth: 300
  },
  formControl2: {
    margin: theme.spacing.unit,
    minWidth: 250,
    maxWidth: 300
  },
  selectWidth: {
    minWidth: 250
  }
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

class Query extends React.Component {
  constructor(props) {
    super(props);
    var initqsParams = {
      queryType: '',
      datasets: []
    };
    var qsParams = LoadQueryString('Query', initqsParams, this.props.urlQueryString);
    if (qsParams.datasets.length === 0 && this.props.availableDatasets.length > 0) {
      qsParams.datasets = [this.props.availableDatasets[0]];
      this.props.setURLQs(SaveQueryString('Query', qsParams));
    }
    this.state = {
      qsParams: qsParams
    };
  }

  setQuery = event => {
    if (event.target.value !== this.state.qsParams.queryType) {
      // delete query string from last query
      var found = false;
      for (var i in this.props.pluginList) {
        if (this.state.qsParams.queryType === this.props.pluginList[i].queryName) {
          found = true;
        }
      }

      if (found) {
        RemoveQueryString('Query:' + this.state.qsParams.queryType);
      }

      var oldparams = this.state.qsParams;
      oldparams.queryType = event.target.value;
      this.props.setURLQs(SaveQueryString('Query', oldparams));
      this.setState({ qsParams: oldparams });
    }
  };

  handleChange = ev => {
    var newdatasets = [ev.target.value];
    if (ev === undefined) {
      newdatasets = [];
    }
    var oldparams = this.state.qsParams;
    oldparams.datasets = newdatasets;
    this.props.setURLQs(SaveQueryString('Query', oldparams));

    this.setState({ qsParams: oldparams });
  };

  render() {
    const { classes, theme } = this.props;

    var queryname = 'Select Query';
    var querytype = '';
    var initmenuitem = <MenuItem value={queryname}>{queryname}</MenuItem>;

    // if query is selected, pass query along
    if (this.state.qsParams.queryType !== '') {
      // check if query is in the list of plugins
      var found = false;
      for (var i in this.props.pluginList) {
        if (this.state.qsParams.queryType === this.props.pluginList[i].queryName) {
          found = true;
        }
      }
      if (found) {
        queryname = this.state.qsParams.queryType;
        querytype = queryname;
        initmenuitem = <div />;
      }
    }

    var datasetstr = '';
    //console.assert(this.state.qsParams.datasets.length <= 1);
    for (var item in this.state.qsParams.datasets) {
      datasetstr = this.state.qsParams.datasets[item];
    }

    // TODO: fix default menu option (maybe make the custom query the default)
    return (
      <div className={classes.root}>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="controlled-open-select">Query Type</InputLabel>
          <Select
            value={queryname}
            onChange={this.setQuery}
            input={<Input name="query" id="controlled-open-select" />}
          >
            {initmenuitem}
            {this.props.pluginList.slice(0, this.props.reconIndex).map(function(val) {
              return (
                <MenuItem key={val.queryName} value={val.queryName}>
                  {val.queryName}
                </MenuItem>
              );
            })}
            <MenuItem key={'recon'} value={'recon'} disabled>
              <i>Reconstruction Related</i>
            </MenuItem>
            {this.props.pluginList
              .slice(this.props.reconIndex, this.props.pluginList.length)
              .map(function(val) {
                return (
                  <MenuItem key={val.queryName} value={val.queryName}>
                    {val.queryName}
                  </MenuItem>
                );
              })}
          </Select>
        </FormControl>
        <FormControl className={classes.formControl2}>
          <InputLabel htmlFor="select-multiple-chip">Select dataset</InputLabel>
          <Select
            value={this.state.qsParams.datasets}
            onChange={this.handleChange}
            input={<Input id="select-multiple-chip" />}
            renderValue={selected => (
              <div className={classes.chips}>
                {selected.map(value => (
                  <Chip key={value} label={value} className={classes.chip} />
                ))}
              </div>
            )}
            MenuProps={MenuProps}
          >
            {this.props.availableDatasets.map(name => (
              <MenuItem
                key={name}
                value={name}
                style={{
                  fontWeight:
                    this.state.qsParams.datasets.indexOf(name) === -1
                      ? theme.typography.fontWeightRegular
                      : theme.typography.fontWeightMedium
                }}
              >
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Divider className={classes.divider} />
        <QueryForm
          queryType={querytype}
          datasetstr={datasetstr}
          dataset={this.state.qsParams.datasets[0]}
        />
      </div>
    );
  }
}

Query.propTypes = {
  pluginList: PropTypes.array.isRequired,
  reconIndex: PropTypes.number.isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  setURLQs: PropTypes.func.isRequired,
  urlQueryString: PropTypes.string.isRequired,
  availableDatasets: PropTypes.array.isRequired
};

var QueryState = function(state) {
  return {
    pluginList: state.app.get('pluginList'),
    reconIndex: state.app.get('reconIndex'),
    availableDatasets: state.neo4jsettings.availableDatasets,
    urlQueryString: state.app.get('urlQueryString')
  };
};

var QueryDispatch = function(dispatch) {
  return {
    setURLQs: function(querystring) {
      dispatch(setUrlQS(querystring));
    }
  };
};

export default withStyles(styles, { withTheme: true })(
  connect(
    QueryState,
    QueryDispatch
  )(Query)
);
