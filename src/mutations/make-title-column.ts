import { Editor } from 'slate';
import * as table from '../layout';
import { Option } from '../option';

export function makeTitleColumn(opts: Required<Option>, editor: Editor) {
  const t = table.TableLayout.create(editor, opts);
  if (!t) return false;

  const currentCell = table.TableLayout.currentCell(editor, opts);
  if (!currentCell) return;

  const columnIndex = t.columnIndex;
  const currentTable = t.table;
  const columnCells = currentTable.map(row => {
    return row[columnIndex];
  });

  columnCells.forEach(columnCell => {
    const isTitleColumn = columnCell.block.data.get('isTitleColumn');
    editor.setNodeByKey(columnCell.key, {
      type: columnCell.block.type,
      data: {
        ...columnCell.block.data.toObject(),
        isTitleColumn: !isTitleColumn,
      },
    });
  });
}
