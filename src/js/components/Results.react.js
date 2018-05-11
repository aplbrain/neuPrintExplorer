/*
 * Main page to hold results from query.  This could be
 * a simple table or a table of tables.
*/

"use strict";

import React from 'react';
import Typography from 'material-ui/Typography';
import Fade from 'material-ui/transitions/Fade';
import { CircularProgress } from 'material-ui/Progress';
import { connect } from 'react-redux';
import SimpleTables from './SimpleTables.react';
import { withStyles } from 'material-ui/styles';
import _ from "underscore";
import PropTypes from 'prop-types';
import ResultsTopBar from './ResultsTopBar.react';
import { Responsive, WidthProvider } from 'react-grid-layout';
const ResponsiveGridLayout = WidthProvider(Responsive);


const styles = () => ({
    root: {
        flexGrow: 1,
    },
    scroll: {
        overflowY: "auto",
        height: "100%",
    },
    flex: {
        flex: 1,
    }
});

var GLBINDEX = 0;

class Results extends React.Component {
    // if only query string has updated, prevent re-render
    shouldComponentUpdate(nextProps, nextState) {
        nextProps.location["search"] = this.props.location["search"];
        return (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state));
    }

    downloadFile = (index) => {
        var csvdata = "";
        this.props.allTables[index].map( (tableinfo) => {
            // load one table -- fixed width
            
            // load table name
            var numelements = tableinfo.header.length;
            csvdata = csvdata + tableinfo.name + ",";
            for (var i = 1; i < numelements; i++) {
                csvdata = csvdata + ",";
            }
            csvdata = csvdata + "\n";

            // load headers
            tableinfo.header.map( (headinfo) => {
                csvdata = csvdata + headinfo.getValue() + ",";
            });
            csvdata = csvdata + "\n";

            // load data
            tableinfo.body.map( (rowinfo) => {
                rowinfo.map( (elinfo) => {
                    csvdata = csvdata + elinfo.getValue() + ",";
                });
                csvdata = csvdata + "\n";
            });
        });

        var element = document.createElement("a");
        var file = new Blob([csvdata], {type: 'text/csv'});
        element.href = URL.createObjectURL(file);
        element.download = "results.csv";
        element.click();
    }

    render() {
        // TODO: show query runtime results
        const { classes } = this.props; 

        return (
            <div>
                { (this.props.userInfo !== null && this.props.allTables !== null) ? (
                    <div />    
                ) : (
                    <Typography variant="title">No Query Results</Typography>
                  )
                }
                <Fade
                    in={this.props.isQuerying}
                    style={{
                        transitionDelay: this.props.isQuerying ? '800ms' : '0ms',
                    }}
                    unmountOnExit
                >
                    <CircularProgress />
                </Fade>
                { (this.props.neoError !== null) ? 
                    (<Typography>Error: {this.props.neoError.code}</Typography>) :
                    (this.props.allTables !== null ?
                        (
                            <ResponsiveGridLayout 
                                                    className="layout" 
                                                    rowHeight={30} 
                                                    breakpoints={{lg: 2000}}
                                                    cols={{lg: 12}}
                                                    draggableHandle=".topresultbar"
                                                    compactType="horizontal"
                            >
                                {this.props.allTables.map( (result, index) => {
                                    GLBINDEX += 1;
                                    return (!this.props.clearIndices.has(index)) ? (
                                        <div 
                                            key={GLBINDEX} 
                                            data-grid={{
                                                x: (index*6)%12,
                                                y: Math.floor(index/2)*18,
                                                w: (this.props.allTables.length > 1) ? 6 : 12,
                                                h: 18
                                            }}
                                        >
                                            <div className={classes.scroll}>
                                                <ResultsTopBar
                                                                id="blah"
                                                                downloadCallback={this.downloadFile}
                                                                name={(result.length == 1) ? 
                                                                        result[0].name :
                                                                        String(result.length) + " tables"
                                                                } 
                                                                queryStr={result[0].queryStr}
                                                                index={index}
                                                />
                                                <SimpleTables 
                                                                allTables={result}
                                                />
                                            </div>
                                        </div>
                                    ) : <div key={GLBINDEX} />;
                                })}
                            </ResponsiveGridLayout>
                        ) : 
                        (<div />)
                    )
                }
            </div>
        );
    }
}

Results.propTypes = {
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }),
    allTables: PropTypes.array,
    clearIndices: PropTypes.object,
    numClear: PropTypes.number,
    queryObj: PropTypes.object.isRequired, 
    neoError: PropTypes.object,
    isQuerying: PropTypes.bool.isRequired,
    classes: PropTypes.object.isRequired,
    userInfo: PropTypes.object,
};

// result data [{name: "table name", header: [headers...], body: [rows...]
var ResultsState = function(state){
    return {
        isQuerying: state.query.isQuerying,
        neoError: state.query.neoError,
        allTables: state.results.allTables,
        clearIndices: state.results.clearIndices,
        numClear: state.results.numClear,
        userInfo: state.user.userInfo,
        queryObj: state.query.neoQueryObj,
    }   
};

export default withStyles(styles)(connect(ResultsState, null)(Results));
