import * as React from 'react';

export type Option = {
  typeCell?: string;
  typeRow?: string;
  typeTable?: string;
  typeContent?: string;
  selectionColor?: string;
  titleColor?: string;
  isTitleRow?: boolean;
  cellStyle?: React.CSSProperties;
  rowStyle?: React.CSSProperties;
  tableStyle?: React.CSSProperties;
  defaultColumnWidth?: number;
};

export const defaultOptions: Required<Option> = {
  typeCell: 'table_cell',
  typeRow: 'table_row',
  typeTable: 'table',
  typeContent: 'table_content',
  selectionColor: '#B9D3FC',
  titleColor: '#EEEEEE',
  isTitleRow: true,
  cellStyle: { padding: '3px' },
  rowStyle: {},
  tableStyle: {},
  defaultColumnWidth: 15,
};
