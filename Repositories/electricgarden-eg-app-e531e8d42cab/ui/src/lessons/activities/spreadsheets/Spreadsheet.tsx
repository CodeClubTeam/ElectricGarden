import './Spreadsheet.css';

import { HotTable } from '@handsontable/react';
import React from 'react';

type Props = {
    data: string[][];
    colHeaders?: string[];
    rowHeaders?: string[];
    colWidths?: number[];
    rowHeights?: number[];
    width?: string;
    height?: string;
};

export const Spreadsheet: React.FC<Props> = ({
    data,
    colHeaders,
    rowHeaders,
    colWidths,
    rowHeights,
    width,
    height,
}) => {
    return (
        <HotTable
            data={data}
            colHeaders={colHeaders !== undefined ? colHeaders : true}
            rowHeaders={rowHeaders !== undefined ? rowHeaders : true}
            colWidths={colWidths}
            rowHeights={rowHeights}
            width={width ? width : '600'}
            height={height ? height : '300'}
            className={'htCenter htMiddle'}
            afterGetColHeader={function (col, TH) {
                TH.className = 'htCenter htMiddle';
            }}
            afterGetRowHeader={function (row, TH) {
                TH.className = 'htCenter htMiddle';
            }}
            licenseKey="non-commercial-and-evaluation"
            columnSorting={true}
        />
    );
};
