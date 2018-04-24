import React, { Component } from 'react';
import ReactTable from 'react-table';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Downloads from './Downloads.js';
import EditCard from './EditCard.js';

import axios from 'axios';
import "react-table/react-table.css";

let lib = require('../utils/library.js');
let json2csv = require('json2csv');


class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dbIndex: props.dbIndex,
            table: props.table,
            columns: props.columns,
            data: props.data,
            url: props.url,
            dbPrimaryKeys: [],
            tablePrimaryKeys: [],
            editFeatureEnabled: false,
            editFeatureChangesMade: {}
        };
        this.renderEditableCell = this.renderEditableCell.bind(this);
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            dbIndex: newProps.dbIndex,
            table: newProps.table,
            columns: newProps.columns,
            url: newProps.url,
            data: newProps.data,
            editFeatureEnabled: this.state.table !== newProps.table ? false : this.state.editFeatureEnabled
        });

        // Enable PK related features if table has a PK
        if (newProps.dbPkInfo && this.state.table) {
            for (let i = 0; i < newProps.dbPkInfo.length; i++) {
                if (newProps.dbPkInfo[i]["table"] === this.state.table) {
                    this.setState({
                        tablePrimaryKeys: newProps.dbPkInfo[i]["primary_keys"]
                    });
                }
            }
        }
    }

    // Allows EditCard.js to change the state here
    changeEditFeatureEnabled(featureEnabled) {
        this.setState({
            editFeatureEnabled: featureEnabled
        });
    }

    // Allows EditCard.js to change the state here
    changeEditFeatureChangesMade(newChanges) {
        this.setState({
            editFeatureChangesMade: newChanges
        });
    }

    // Renders an editable cell + manages changes made to it using helpers
    renderEditableCell(cellInfo) {
        return (
            <div
                style={{ backgroundColor: "#fafafa", "border": "none", "borderBottom": "1px solid lightpink", padding: "1px" }}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    let data = [...this.state.data];

                    let changedRowIndex = cellInfo.index;
                    let changedColumnName = cellInfo.column.id;
                    let oldRow = JSON.stringify(this.state.data[changedRowIndex]);
                    let oldCellValue = data[changedRowIndex][changedColumnName];
                    let newCellValue = e.target.innerHTML;

                    // ToDo: when original value is NULL, and you don't change it, it sets it to "" from NULL... prevent it
                    if (String(oldCellValue) !== String(newCellValue)) {
                        let changedRowPk = {};
                        for (let i = 0; i < this.state.tablePrimaryKeys.length; i++) {
                            changedRowPk[this.state.tablePrimaryKeys[i]] = data[changedRowIndex][this.state.tablePrimaryKeys[i]]
                        }

                        console.log(changedColumnName, "column of row #", changedRowIndex, "with pk = (", JSON.stringify(changedRowPk), ") changed from ", oldCellValue, "to", newCellValue);


                        data[changedRowIndex][changedColumnName] = newCellValue;

                        let newRow = data[changedRowIndex];

                        //this.updateDbIfNeeded(oldRow, newRow, changedColumnName);
                        this.setState({ data });
                    }
                }}
                dangerouslySetInnerHTML={{
                    __html: this.state.data[cellInfo.index][cellInfo.column.id]
                }}
            />
        );
    }

    render() {
        //const classes = this.props.classes;
        let { columns, data } = this.state;
        let parsedColumns = [];

        // Create columns with expected column properties
        if (columns) {
            parsedColumns = columns.map((columnName) => {
                let columnRename = lib.getColumnConfig(this.state.dbIndex, this.state.table, columnName, "rename");
                let columnVisibility = lib.getColumnConfig(this.state.dbIndex, this.state.table, columnName, "visible");
                let columnEditability = lib.getColumnConfig(this.state.dbIndex, this.state.table, columnName, "editable");

                let columnWidthDefault = lib.getTableConfig(this.state.dbIndex, this.state.table, "defaultWidthPx");
                let columnWidth = lib.getColumnConfig(this.state.dbIndex, this.state.table, columnName, "widthPx");

                let columnMinWidth = lib.getColumnConfig(this.state.dbIndex, this.state.table, columnName, "minWidthPx");
                let columnMaxWidth = lib.getColumnConfig(this.state.dbIndex, this.state.table, columnName, "maxWidthPx");

                return ({
                    id: columnName,
                    Header: columnRename ? columnRename : columnName,
                    accessor: columnName,
                    show: columnVisibility !== null ? columnVisibility : true,
                    width: columnWidth !== null ? columnWidth : (columnWidthDefault ? columnWidthDefault : undefined),
                    maxWidth: columnMaxWidth !== null ? columnMaxWidth : undefined,
                    minWidth: columnMinWidth !== null ? columnMinWidth : 100,
                    headerStyle: { fontWeight: 'bold' },
                    Cell: this.state.editFeatureEnabled === true && columnEditability !== false ? this.renderEditableCell : null
                });
            });
        }

        // render()
        return (
            <div>
                <ReactTable
                    data={data}
                    columns={parsedColumns}
                    defaultPageSize={10} className="-striped -highlight"
                    pageSizeOptions={[10, 50, 100, 200, 500, 1000]}
                    previousText="Previous Page"
                    nextText="Next Page"
                    noDataText={this.props.noDataText} />

                <div className={this.props.classes.cardGroups} >
                    <EditCard
                        dbIndex={this.state.dbIndex}
                        table={this.state.table}
                        columns={this.state.columns}
                        dbPkInfo={this.props.dbPkInfo}
                        url={this.state.url}
                        featureEnabled={this.state.editFeatureEnabled}
                        changesMade={this.state.editFeatureChangesMade}
                        changeEditFeatureChangesMade={this.changeEditFeatureChangesMade.bind(this)}
                        changeEditFeatureEnabled={this.changeEditFeatureEnabled.bind(this)} />

                    <Downloads
                        dbIndex={this.state.dbIndex}
                        table={this.state.table}
                        columns={this.state.columns}
                        data={this.state.data}
                        url={this.state.url}
                        totalRows={this.props.totalRows} />
                </div>
            </div>);
    }
}

DataTable.propTypes = {
    classes: PropTypes.object.isRequired,
};

const styleSheet = {
    root: {
        width: '29%',
        height: '100%',
        float: 'left',
    },
    headerClass: {
        fontWeight: "bold"
    },
    button: {
        margin: 5,
        float: 'right'
    },
    topMargin: {
        margin: 5,
        marginTop: (5) * 5
    },
    cardGroups: {
        display: 'flex',
        flexDirection: 'row'
    }
};
export default withStyles(styleSheet)(DataTable);