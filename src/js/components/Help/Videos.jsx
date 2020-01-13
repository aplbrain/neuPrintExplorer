import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const styles = () => ({
  root: {
    flexGrow: 1
  },
  roottext: {
    flex: 1
  }
});

function HelpVideos(props) {
  const { classes } = props;
  return (
    <div className={classes.root} style={{ padding: 8 * 3, width: '100%' }}>
      <div className={classes.roottext}>
        <Typography>Tutorial videos highlighting different aspects of neuPrintExplorer</Typography>
      </div>
      <Grid container spacing={24}>
        <Grid item xs>
          <iframe
            title="Getting started"
            width="560"
            height="315"
            src="https://www.youtube.com/embed/-BHftRHDQtc"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Grid>
        <Grid item xs>
          <iframe
            title="Common connectivity query"
            width="560"
            height="315"
            src="https://www.youtube.com/embed/VAtI6V86qlY"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Grid>
      </Grid>
    </div>
  );
}

HelpVideos.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HelpVideos);