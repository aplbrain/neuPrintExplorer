import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { withStyles } from '@material-ui/core/styles';

import TablePaginationActions from 'helpers/TablePaginationActions';

function desc(a, b, orderBy) {
  let aVal = a[orderBy];
  let bVal = b[orderBy];

  // need to check if the cell has a value / action object
  if (aVal && typeof aVal === 'object' && 'value' in aVal) {
    aVal = aVal.value;
  }

  if (bVal && typeof bVal === 'object' && 'value' in bVal) {
    bVal = bVal.value;
  }

  if (bVal < aVal) {
    return -1;
  }
  if (bVal > aVal) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const styles = theme => ({
  root: {},
  clickable: {
    cursor: 'pointer'
  },
  scroll: {
    width: '100%',
    marginTop: theme.spacing.unit * 1,
    overflowY: 'auto',
    overflowX: 'auto',
    height: '100%'
  }
});

class SimpleTable extends React.Component {
  state = {
    order: 'asc',
    orderBy: '',
    selected: [],
    data: [],
    page: 0,
    rowsPerPage: 5
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  handleCellClick = action => event => {
    action();
  };

  handleRequestSort = property => event => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  render() {
    const { query, classes } = this.props;
    const { page, rowsPerPage, orderBy, order } = this.state;
    const emptyRows =
      rowsPerPage - Math.min(rowsPerPage, query.result.data.length - page * rowsPerPage);

    return (
      <div className={classes.root}>
        <div className={classes.scroll}>
          <Table>
            <TableHead>
              <TableRow>
                {query.result.columns.map((header, index) => {
                  return (
                    <TableCell key={index} sortDirection={orderBy === index ? order : false}>
                      <TableSortLabel
                        active={orderBy === index}
                        direction={order}
                        onClick={this.handleRequestSort(index)}
                      >
                        {header}
                      </TableSortLabel>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {stableSort(query.result.data, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  return (
                    <TableRow hover key={index}>
                      {row.map((cell, i) => {
                        if (cell && typeof cell === 'object' && 'value' in cell) {
                          if ('action' in cell) {
                            return (
                              <TableCell
                                className={classes.clickable}
                                key={i}
                                onClick={this.handleCellClick(cell.action)}
                              >
                                {cell.value}
                              </TableCell>
                            );
                          }
                          return <TableCell key={i}>{cell.value}</TableCell>;
                        }
                        return <TableCell key={i}>{cell}</TableCell>;
                      })}
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 48 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          component="div"
          count={query.result.data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions}
        />
      </div>
    );
  }
}

export default withStyles(styles)(SimpleTable);
