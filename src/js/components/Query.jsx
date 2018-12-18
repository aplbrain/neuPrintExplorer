/*
 * Main page holding query selector and query forms.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from 'react-select';
import { withRouter } from 'react-router-dom';
import slug from 'slugg';
import Tooltip from '@material-ui/core/Tooltip';

import InputLabel from '@material-ui/core/InputLabel';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

import QueryForm from './QueryForm';
import { getSiteParams, setQueryString } from '../helpers/queryString';

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
  },
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  },
  experimentalPlugin: {
    display: 'inline-flex',
    verticalAlign: 'center'
  }
});

class Query extends React.Component {
  setQuery = selectedQuery => {
    setQueryString({ qt: selectedQuery.value });
  };

  render() {
    const { classes, pluginList, location } = this.props;
    const qsParams = getSiteParams(location);

    const queryType = qsParams.get('qt') || 'not selected';
    const queryName =
      pluginList
        .filter(plugin => slug(plugin.queryName) === queryType)
        .map(plugin => plugin.queryName)[0] || 'Select Query';

    const generalOptions = pluginList
      .filter(plugin => plugin.queryCategory === undefined)
      .map(val => ({
        value: slug(val.queryName),
        label: val.isExperimental ? (
          <div className={classes.experimentalPlugin}>
            {val.queryName}
            <Tooltip title="under development" placement="right">
              <Icon style={{ margin: '4px', fontSize: '12px' }}>build</Icon>
            </Tooltip>
          </div>
        ) : (
          val.queryName
        )
      }));

    const reconOptions = pluginList
      .filter(plugin => plugin.queryCategory === 'recon')
      .map(val => ({
        value: slug(val.queryName),
        label: val.isExperimental ? (
          <div className={classes.experimentalPlugin}>
            {val.queryName}
            <Tooltip title="under development" placement="right">
              <Icon style={{ margin: '4px', fontSize: '12px' }}>build</Icon>
            </Tooltip>
          </div>
        ) : (
          val.queryName
        )
      }));

    const queryOptions = [
      {
        label: 'General',
        options: generalOptions
      },
      {
        label: 'Reconstruction Related',
        options: reconOptions
      }
    ];

    const dataSet = qsParams.get('dataset') || '';

    // TODO: fix default menu option (maybe make the custom query the default)
    return (
      <div className={classes.root}>
        <InputLabel htmlFor="controlled-open-select">Query Type</InputLabel>
        <Select
          className={classes.select}
          value={{ label: queryName, value: queryName }}
          onChange={this.setQuery}
          options={queryOptions}
        />

        <Divider className={classes.divider} />

        <QueryForm queryType={queryType} dataSet={dataSet} />
      </div>
    );
  }
}

Query.propTypes = {
  pluginList: PropTypes.arrayOf(PropTypes.func).isRequired,
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

const QueryState = state => ({
  pluginList: state.app.get('pluginList')
});

export default withRouter(withStyles(styles, { withTheme: true })(connect(QueryState)(Query)));
