import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Neuroglancer from '@janelia-flyem/react-neuroglancer';
import Grid from '@material-ui/core/Grid';

const NeuroGlancer = (props) => {
  const { ngLayers, ngNeurons, ngCoordinates } = props;
  const viewerState = {
    perspectiveOrientation: [0.1, -0.3, -0.3, 0.8],
    perspectiveZoom: 95,
    navigation: {
      pose: {
        position: {
          voxelCoordinates: []
        }
      },
      zoomFactor: 8
    },
    layout: 'xy-3d',
    layers: {}
  };

  // loop over ngLayers and add them to the viewerState
  ngLayers.forEach(layer => {
    // add segmentation && grayscale layers
    viewerState.layers[layer.get('dataSet')] = {
      source: `dvid://${layer.get('host')}/${layer.get('uuid')}/${layer.get('dataInstance')}`,
      type: layer.get('dataType'),
      segments: []
    };
  });
  // loop over the neurons and add them to the layers
  ngNeurons.forEach(neuron => {
    viewerState.layers[neuron.get('dataSet')].segments.push(neuron.get('id'));
  });

  // set the x,y,z coordinates
  viewerState.navigation.pose.position.voxelCoordinates = ngCoordinates.toJS();

  return (
    <Grid container>
      <Grid item xs={12}>
        <Neuroglancer perspectiveZoom={80} viewerState={viewerState} />
      </Grid>
    </Grid>
  );
}

NeuroGlancer.propTypes = {
  ngLayers: PropTypes.object.isRequired,
  ngNeurons: PropTypes.object.isRequired,
  ngCoordinates: PropTypes.object.isRequired
};

const NeuroGlancerState = state => ({
    ngState: state.neuroglancer,
    ngLayers: state.neuroglancer.get('layers'),
    ngNeurons: state.neuroglancer.get('neurons'),
    ngCoordinates: state.neuroglancer.get('coordinates')
  });

export default connect(
  NeuroGlancerState,
)(NeuroGlancer);
