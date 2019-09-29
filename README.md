#wisetable

:pen: An editable table plugin for Slate.js


## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [Commands](#commands)
* [Test](#test)
* [Changelog](#changelog)
* [License](#license)

## Install

- use npm

```sh
npm i -S wise-table
```

## Usage

``` typescript
import { Editor } from 'slate-react';
import { ValueJSON, Value } from 'slate';

import React from 'react';
import { EditTable, EditTableCommands, hasTablePlugin } from 'wise-table';

const tablePlugin = EditTable();

const plugins = [tablePlugin];

class SlateEditor extends Component {
  state: {
    value: Value;
  };

  constructor(props) {
    super(props);
    this.state = {
      value: Value.fromJSON(props.initialValue),
    };
  }

  onChange = ({ value }) => {
    this.setState({ value });
    this.props.onChange({ value });
  };

  removeTable = () => this.editorRef.removeTable();
  insertTable = () => this.editorRef.insertTable(5, 5, { columnWidth: 200, maxWidth: 500 });
  insertLeft = () => this.editorRef.insertLeft();
  insertRight = () => this.editorRef.insertRight();
  insertAbove = () => this.editorRef.insertAbove();
  insertBelow = () => this.editorRef.insertBelow();
  removeColumn = () => this.editorRef.removeColumn();
  removeRow = () => this.editorRef.removeRow();
  mergeSelection = () => this.editorRef.mergeSelection();
  splitCell = () => this.editorRef.splitCell();
  enableResizing = () => this.editorRef.enableResizing();
  disableResizing = () => this.editorRef.disableResizing();

render() {
    return (
      <>
        <button onMouseDown={this.insertTable}>Insert Table</button>
        <button onMouseDown={this.insertAbove}>Insert Above</button>
        <button onMouseDown={this.insertBelow}>Insert Below</button>
        <button onMouseDown={this.insertLeft}>Insert Left</button>
        <button onMouseDown={this.insertRight}>Insert Right</button>
        <button onMouseDown={this.mergeSelection}>merge selection</button>
        <button onMouseDown={this.splitCell}>split cell</button>
        <button onMouseDown={this.removeColumn}>Remove Column</button>
        <button onMouseDown={this.removeRow}>Remove Row</button>
        <button onMouseDown={this.removeTable}>Remove Table</button>
        <button onMouseDown={this.disableResizing}>disable resizing</button>
        <button onMouseDown={this.enableResizing}>enable resizing</button>
        <Editor
          ref={editor => {
              this.editorRef = editor;
          }}
          plugins={plugins}
          placeholder="Paragraph component..."
          value={this.state.value}
          onChange={this.onChange}
        />
      </>
    );
  }
}

## Commands


| Command           | Description                                                       |
|:------------------|:------------------------------------------------------------------|
| `insertTable`     | create and insert new table                                       |
| `removeTable`     | remove table                                                      |
| `insertLeft`      | insert new column to left of current anchor cell                  |
| `insertRight`     | insert new column to right of current anchor cell                 |
| `insertAbove`     | insert new row to above of current anchor cell                    |
| `insertBelow`     | insert new row to below of current anchor cell                    |
| `removeColumn`    | remove selected column                                            |
| `removeRow`       | remove selected row                                               |
| `mergeSelection`  | merge current selection                                           |
| `splitCell`       | split current cell                                                |
| `enableResizing`  | enable cell resizing                                              |
| `enableResizing`  | disable cell resizing                                             |

## Query

| Query                    | Description                                                          |
|:-------------------------|:---------------------------------------------------------------------|
| `isSelectionInTable`     | If selection is in current table, return true                        |
| `canSelectedCellsMerge`  | If selection is able to merge diagonally selected cells, return true |
| `findCurrentTable`       | find current table block                                             |
      
## Test

``` sh
npm t
```

## Contribute

Yet to make documentation how we can work on features like split cells & any bugs

## Changelog

#### v0.1.0

- Initial release
