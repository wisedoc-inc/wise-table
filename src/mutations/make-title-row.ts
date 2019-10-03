import { Editor } from 'slate';
import * as table from '../layout';
import { Option } from '../option';

export function makeTitleRow(opts: Required<Option>, editor: Editor) {
  const t = table.TableLayout.create(editor, opts);
  if (!t) return false;
  const currentCell = table.TableLayout.currentCell(editor, opts);
  if (!currentCell) return;

  const currentRow = table.TableLayout.currentRow(editor, opts);
  const isTitleRow = currentRow.data.get('isTitleRow');
  editor.setNodeByKey(currentRow.key, {
    type: currentRow.type,
    data: {
      ...currentRow.data.toObject(),
      isTitleRow: !isTitleRow,
    },
  });
}
