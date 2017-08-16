import React, { Component } from 'react';
import ReactTable from 'react-table';
import PropTypes from 'prop-types';
import { withStyles, createStyleSheet } from 'material-ui/styles';

import "react-table/react-table.css";

const styleSheet = createStyleSheet({
    root: {
        width: '29%',
        height: '100%',
        float: 'left',
    }
});

class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dbIndex: props.dbIndex,
            table: props.table,
            columns: props.columns,
            data: props.data
        };
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            columns: newProps.columns,
            data: newProps.data
        });
    }

    render() {
        let { columns, data } = this.state;
        let parsedColumns = [];

        if (columns) {
            parsedColumns = columns.map((columnName) => {
                return ({
                    Header: columnName,
                    accessor: columnName
                });
            });
        }

        return (<div>
        			<ReactTable data={ data } columns={ parsedColumns } defaultPageSize={ 10 } className="-striped -highlight" />
        			<br />
        			<br />
        			<div style={{ textAlign: "center" }} >
        				<em>Tip: Hold shift when sorting to multi-sort!</em>
        			</div>
        		</div>
        );
    }
}

DataTable.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styleSheet)(DataTable);