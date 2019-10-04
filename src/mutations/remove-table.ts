import { Editor } from 'slate';
import { TableLayout } from '../layout';
import { Option, defaultOptions } from '../option';

export function removeTable(opts: Required<Option> = defaultOptions, editor: Editor) {
  const table = TableLayout.currentTable(editor, opts);
  if (!table) return editor;
  const nextNode = editor.value.document.getNextNode(table.key);
  if (!nextNode) {
    return editor
      .removeNodeByKey(table.key)
      .insertText('')
      .moveToStartOfNextText()
      .focus();
  } else if (nextNode && (nextNode as any).type === 'caption') {
    return editor.removeNodeByKey(table.key).removeNodeByKey(nextNode.key);
  }
}
