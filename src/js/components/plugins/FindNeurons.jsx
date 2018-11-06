import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from 'react-select';
import { withRouter } from 'react-router';
import randomColor from 'randomcolor';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';

import { submit } from 'actions/plugins';
import { setUrlQS } from 'actions/app';
import { skeletonAddandOpen } from 'actions/skeleton';
import RoiHeatMap, { ColorLegend } from '../../components/visualization/MiniRoiHeatMap.react';
import RoiBarGraph from '../../components/visualization/MiniRoiBarGraph.react';
import NeuronHelp from '../NeuronHelp.react';
import NeuronFilter from '../NeuronFilter.react';
import { getQueryString } from 'helpers/queryString';

const styles = theme => ({
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  }
});

// this should match the name of the file this plugin is stored in.
const pluginName = 'FindNeurons';

class FindNeurons extends React.Component {
  constructor(props) {
    super(props);
    // set the default state for the query input.
    this.state = {
      inputROIs: [],
      outputROIs: [],
      neuronsrc: '',
      limitBig: true,
      statusFilters: []
    };
  }
  static get queryName() {
    // This is the string used in the 'Query Type' select.
    return 'Find neurons';
  }

  static get queryDescription() {
    // This is a description of the purpose of the plugin.
    // it will be displayed in the form above the custom
    // inputs for this plugin.
    return 'Find neurons that have inputs or outputs in ROIs';
  }

  processSimpleConnections = (dataSet, apiResponse) => {
    const { actions } = this.props;
    const data = apiResponse.data.map(row => {
      return [
        {
          value: row[2],
          action: () => actions.skeletonAddandOpen(row[2], dataSet)
        },
        row[1],
        row[3]
      ];
    });

    return {
      columns: ['Neuron ID', 'Neuron', '#connections'],
      data,
      debug: apiResponse.debug
    };
  };

  // this function will parse the results from the query to the
  // Neo4j server and place them in the correct format for the
  // visualization plugin.
  processResults = (dataSet, apiResponse) => {
    const { actions } = this.props;

    const data = apiResponse.data.map(row => {
      const converted = [
        {
          value: row[0],
          action: () => actions.skeletonAddandOpen(row[0], dataSet)
        },
        row[1],
        row[2],
        '-', // empty unless roiInfoObject present
        '-',
        row[4],
        '',
        ''
      ];

      // make sure none is added to the rois list.
      row[7].push('none');
      const roiList = row[7];
      const totalPre = row[5];
      const totalPost = row[6];

      const roiInfoObject = JSON.parse(row[3]);

      if (roiInfoObject) {
        // calculate # pre and post in super rois (which are disjoint) to get total
        // number of synapses assigned to an roi
        let postInSuperRois = 0;
        let preInSuperRois = 0;
        Object.keys(roiInfoObject).forEach(roi => {
          if (
            roiList.find(element => {
              return element === roi;
            })
          ) {
            preInSuperRois += roiInfoObject[roi]['pre'];
            postInSuperRois += roiInfoObject[roi]['post'];
          }
        });

        // add this after the other rois have been summed.
        // records # pre and post that are not in rois
        roiInfoObject['none'] = {
          pre: row[5] - preInSuperRois,
          post: row[6] - postInSuperRois
        };

        const heatMap = (
          <RoiHeatMap
            roiList={roiList}
            roiInfoObject={roiInfoObject}
            preTotal={totalPre}
            postTotal={totalPost}
          />
        );
        converted[6] = heatMap;

        const barGraph = (
          <RoiBarGraph
            roiList={roiList}
            roiInfoObject={roiInfoObject}
            preTotal={totalPre}
            postTotal={totalPost}
          />
        );
        converted[7] = barGraph;

        const postQuery = {
          dataSet, // <string> for the data set selected
          queryString: '/npexplorer/simpleconnections', // <neo4jquery string>
          // cypherQuery: <string> if this is passed then use generic /api/custom/custom endpoint
          visType: 'SimpleTable', // <string> which visualization plugin to use. Default is 'table'
          plugin: pluginName, // <string> the name of this plugin.
          parameters: {
            dataset: dataSet,
            find_inputs: true,
            neuron_id: row[0]
          },
          title: `Connections to [${row[1]}]:bodyID=${row[0]}`,
          menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
          processResults: this.processSimpleConnections
        };
        converted[3] = {
          value: totalPost,
          action: () => actions.submit(postQuery)
        };

        const preQuery = {
          dataSet, // <string> for the data set selected
          queryString: '/npexplorer/simpleconnections', // <neo4jquery string>
          // cypherQuery: <string> if this is passed then use generic /api/custom/custom endpoint
          visType: 'SimpleTable', // <string> which visualization plugin to use. Default is 'table'
          plugin: pluginName, // <string> the name of this plugin.
          parameters: {
            dataset: dataSet,
            find_inputs: false,
            neuron_id: row[0]
          },
          title: `Connections from [${row[1]}]:bodyID=${row[0]}`,
          menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
          processResults: this.processSimpleConnections
        };
        converted[4] = {
          value: totalPre,
          action: () => actions.submit(preQuery)
        };
      }

      return converted;
    });
    return {
      columns: [
        'id',
        'neuron',
        'status',
        '#post (inputs)',
        '#pre (outputs)',
        '#voxels',
        <div>
          roi heatmap <ColorLegend />
        </div>,
        'roi breakdown'
      ],
      data,
      debug: apiResponse.debug
    };
  };

  // use this method to cleanup your form data, perform validation
  // and generate the query object.
  processRequest = () => {
    const { dataSet, actions, history } = this.props;
    const { inputROIs, outputROIs, neuronsrc, statusFilters, limitBig } = this.state;

    const parameters = {
      dataset: dataSet,
      input_ROIs: inputROIs,
      output_ROIs: outputROIs,
      statuses: statusFilters
    };

    if (neuronsrc !== '') {
      if (isNaN(neuronsrc)) {
        parameters['neuron_name'] = neuronsrc;
      } else {
        parameters['neuron_id'] = parseInt(neuronsrc);
      }
    }

    if (limitBig) {
      parameters['pre_threshold'] = 2;
    }

    const query = {
      dataSet, // <string> for the data set selected
      queryString: '/npexplorer/findneurons', // <neo4jquery string>
      // cypherQuery: <string> if this is passed then use generic /api/custom/custom endpoint
      visType: 'SimpleTable', // <string> which visualization plugin to use. Default is 'table'
      plugin: pluginName, // <string> the name of this plugin.
      parameters, // <object>
      title: `Neurons with inputs in [${inputROIs}] and outputs in [${outputROIs}]`,
      menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
      processResults: this.processResults
    };
    actions.submit(query);
    // redirect to the results page.
    history.push({
      pathname: '/results',
      search: getQueryString()
    });
  };

  handleChangeROIsIn = selected => {
    var rois = selected.map(item => item.value);
    this.setState({ inputROIs: rois });
  };

  handleChangeROIsOut = selected => {
    var rois = selected.map(item => item.value);
    this.setState({ outputROIs: rois });
  };

  addNeuron = event => {
    const neuronsrc = event.target.value;
    this.setState({ neuronsrc });
  };

  loadNeuronFilters = params => {
    this.setState({ limitBig: params.limitBig, statusFilters: params.statusFilters });
  };

  // use this function to generate the form that will accept and
  // validate the variables for your Neo4j query.
  render() {
    const { classes, isQuerying, availableROIs } = this.props;
    const { inputROIs, outputROIs, neuronsrc } = this.state;

    const inputOptions = availableROIs.map(name => {
      return {
        label: name,
        value: name
      };
    });

    const inputValue = inputROIs.map(roi => {
      return {
        label: roi,
        value: roi
      };
    });

    const outputOptions = availableROIs.map(name => {
      return {
        label: name,
        value: name
      };
    });

    const outputValue = outputROIs.map(roi => {
      return {
        label: roi,
        value: roi
      };
    });

    return (
      <div>
        <InputLabel htmlFor="select-multiple-chip">Input ROIs</InputLabel>
        <Select
          className={classes.select}
          isMulti
          value={inputValue}
          onChange={this.handleChangeROIsIn}
          options={inputOptions}
          closeMenuOnSelect={false}
        />
        <InputLabel htmlFor="select-multiple-chip">Output ROIs</InputLabel>
        <Select
          className={classes.select}
          isMulti
          value={outputValue}
          onChange={this.handleChangeROIsOut}
          options={outputOptions}
          closeMenuOnSelect={false}
        />
        <FormControl className={classes.formControl}>
          <NeuronHelp>
            <TextField
              label="Neuron name (optional)"
              multiline
              rows={1}
              value={neuronsrc}
              rowsMax={4}
              className={classes.textField}
              onChange={this.addNeuron}
            />
          </NeuronHelp>
          <NeuronFilter callback={this.loadNeuronFilters} datasetstr={this.props.datasetstr} />
        </FormControl>
        <Button
          disabled={isQuerying}
          color="primary"
          variant="contained"
          onClick={this.processRequest}
        >
          Submit
        </Button>
      </div>
    );
  }
}

// data that will be provided to your form. Use it to build
// inputs, selections and for validation.
FindNeurons.propTypes = {
  actions: PropTypes.object.isRequired,
  availableROIs: PropTypes.array.isRequired,
  dataSet: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  isQuerying: PropTypes.bool.isRequired
};

var FindNeuronsState = function(state) {
  return {
    isQuerying: state.query.isQuerying
  };
};

// The submit action which will accept your query, execute it and
// store the results for view plugins to display.
var FindNeuronsDispatch = dispatch => ({
  actions: {
    submit: query => {
      dispatch(submit(query));
    },
    skeletonAddandOpen: (id, dataSet) => {
      dispatch(skeletonAddandOpen(id, dataSet));
    },
    setURLQs: function(querystring) {
      dispatch(setUrlQS(querystring));
    }
  }
});

// boiler plate for redux.
export default withRouter(
  withStyles(styles)(
    connect(
      FindNeuronsState,
      FindNeuronsDispatch
    )(FindNeurons)
  )
);
