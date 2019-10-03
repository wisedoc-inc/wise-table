import * as React from 'react';
import { Editor, Block } from 'slate';
import { Option } from './option';
import { ComponentStore } from './store';
import { useResizableTable, ResizeValue } from './use-resizable';
import { removeSelection, addSelectionStyle } from './selection';
import * as table from './layout';

export type Props = {
  node: Block;
  attributes: { [key: string]: any };
  children: React.ReactNode;
};

const tableStyle = {
  borderSpacing: 0,
  Layout: 'fixed' as const,
  wordBreak: 'break-word' as const,
};

type TableProps = {
  children: React.ReactNode;
  maxWidth?: string;
  store: ComponentStore;
  editor: Editor;
  onInit: (editor: Editor, data: ResizeValue) => void;
  onUpdate: (editor: Editor, data: ResizeValue) => void;
  onResize?: (editor: Editor, data: ResizeValue) => void;
  onResizeStop: (editor: Editor, data: ResizeValue) => void;
  onHandleMouseOver?: () => void;
};

export interface TableHandler {
  update: () => void;
}

export const InnerTable = React.forwardRef<TableHandler, TableProps & { attributes: any; style?: React.CSSProperties }>(
  (props, tableRef) => {
    const [disableResizing, forceUpdate] = React.useState(false);
    const onInit = React.useCallback(
      (values: ResizeValue) => {
        props.onInit(props.editor, values);
      },
      [props.editor],
    );

    const onUpdate = React.useCallback(
      (values: ResizeValue) => {
        props.onUpdate(props.editor, values);
      },
      [props.editor],
    );

    const onResizeStop = React.useCallback(
      (e: Event, values: ResizeValue) => {
        props.editor.blur();
        props.onResizeStop(props.editor, values);
      },
      [props.editor],
    );

    const onResizeStart = React.useCallback(
      (e: Event) => {
        e.stopPropagation();
        props.editor.blur();
        removeSelection(props.editor);
        props.store.setAnchorCellBlock(null);
        props.store.setFocusCellBlock(null);
      },
      [props.editor],
    );

    const { ref, update } = useResizableTable({
      disableResizing,
      maxWidth: props.maxWidth,
      onResizeStart,
      // onResize,
      onResizeStop,
      onInit,
      onUpdate,
      onHandleHover: props.onHandleMouseOver,
    });

    React.useEffect(() => {
      props.store.subscribeDisableResizing(props.editor, v => {
        forceUpdate(v);
      });
    }, []);

    React.useEffect(() => {
      if (!ref.current) {
        ref.current = props.attributes && props.attributes.ref && props.attributes.ref.current;
      }
      update();
    }, []);

    React.useImperativeHandle(tableRef, () => ({
      update: () => {
        update();
      },
    }));

    const onDragStart = React.useCallback((e: React.DragEvent) => {
      e.preventDefault();
    }, []);

    // const onContextMenu = React.useCallback((e: React.SyntheticEvent) => {
    //   e.preventDefault();
    // }, []);

    return (
      <table
        ref={ref}
        style={{ ...props.style, ...tableStyle, width: '100%' }}
        {...props.attributes}
        onDragStart={onDragStart}
        // onContextMenu={onContextMenu}
      >
        {props.children}
      </table>
    );
  },
);

const Table = React.memo(InnerTable);

function updateWidth(editor: Editor, value: ResizeValue) {
  Object.keys(value).forEach(k => {
    const n = editor.value.document.getNode(k);
    if (!Block.isBlock(n)) return;
    editor.setNodeByKey(k, {
      type: n.type,
      data: { ...n.data.toObject(), width: value[k] },
    });
  });
}

const contentStyle = {
  margin: 0,
};

const Content = React.memo((props: { attributes: any; children: React.ReactNode }) => {
  return (
    <p style={contentStyle} {...props.attributes}>
      {props.children}
    </p>
  );
});

type CellProps = {
  attributes: any;
  node: Block;
  store: ComponentStore;
  editor: Editor;
  opts: Required<Option>;
  children: React.ReactNode;
};

const Cell = React.memo((props: CellProps) => {
  const isRightClick = (e: any) => {
    if (e.which) {
      return e.which === 3;
    }
    if (e.button) {
      return e.button === 2;
    }
    return false;
  };

  const onMouseUp = React.useCallback((e: Event) => {
    props.store.clearCellSelecting(props.editor);
    window.removeEventListener('mouseup', onMouseUp);
  }, []);

  const onWindowClick = React.useCallback(
    (e: Event) => {
      if (!table.findCurrentTable(props.editor, props.opts)) {
        removeSelection(props.editor);
        props.store.setAnchorCellBlock(null);
        props.store.setFocusCellBlock(null);
        window.removeEventListener('click', onWindowClick);
      }
    },
    [props.editor, props.opts],
  );

  React.useEffect(() => {
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('click', onWindowClick);
    };
  }, [onMouseUp, onWindowClick]);

  const onMouseDown: ((event: React.MouseEvent<HTMLTableDataCellElement, MouseEvent>) => void) | undefined = e => {
    if (!(e.target instanceof HTMLElement)) return;
    if (!isRightClick(e)) {
      props.store.setAnchorCellBlock(null);
      props.store.setFocusCellBlock(null);
      removeSelection(props.editor);
      props.store.setCellSelecting(props.editor);
      const anchorCellBlock = table.findCellBlockByElement(props.editor, e.target, props.opts);
      props.store.setAnchorCellBlock(anchorCellBlock);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('click', onWindowClick);
    }
  };
  const onContextMenu = (e: any) => {
    const t = table.TableLayout.create(props.editor, props.opts);
    if (!t) return false;
    const anchored = table.findAnchorCell(props.editor, props.opts);
    const focused = table.findFocusCell(props.editor, props.opts);
    if ((anchored || focused) && props.node.data.get('selectionColor')) {
      e.preventDefault();
    } else {
      // console.log('[non selected cell right clicked ]', anchored);
      removeSelection(props.editor);
    }
  };
  const onMouseOver: ((event: React.MouseEvent<HTMLTableDataCellElement, MouseEvent>) => void) | undefined = e => {
    e.stopPropagation();
    const anchorCellBlock = props.store.getAnchorCellBlock();
    if (anchorCellBlock === null) return;
    if (!(e.target instanceof HTMLElement)) return;
    if (!props.store.getCellSelecting()) return;
    const focusCellBlock = table.findCellBlockByElement(props.editor, e.target, props.opts);
    if (!focusCellBlock) return;
    const prevFocusBlock = props.store.getFocusCellBlock();
    if (focusCellBlock.key === (prevFocusBlock && prevFocusBlock.key)) return;
    const t = table.TableLayout.create(props.editor, props.opts);
    if (!t) {
      removeSelection(props.editor);
      props.store.setAnchorCellBlock(null);
      props.store.setFocusCellBlock(null);
      return;
    }
    props.store.setFocusCellBlock(focusCellBlock);
    // HACK: Add ::selection style when greater than 1 cells selected.
    addSelectionStyle();
    const blocks = table.createSelectedBlockMap(props.editor, anchorCellBlock.key, focusCellBlock.key, props.opts);
    props.editor.withoutSaving(() => {
      t.table.forEach(row => {
        row.forEach(cell => {
          if (blocks[cell.key]) {
            props.editor.setNodeByKey(cell.key, {
              type: cell.block.type,
              data: {
                ...cell.block.data.toObject(),
                selectionColor: props.opts.selectionColor,
              },
            });
          } else {
            props.editor.setNodeByKey(cell.key, {
              type: cell.block.type,
              data: { ...cell.block.data.toObject(), selectionColor: null },
            });
          }
        });
      });
    });
  };
  return (
    <td
      {...props.attributes}
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      onMouseOver={onMouseOver}
      colSpan={props.node.data.get('colspan')}
      rowSpan={props.node.data.get('rowspan')}
      style={{
        ...props.opts.cellStyle,
        minWidth: '32px',
        verticalAlign: 'baseline',
        //TODO: ADD BACKGROUND COLOR FOR MAKE TITLE ROW/COLUMN
        backgroundColor: props.node.data.get('selectionColor'),
      }}
    >
      {props.children}
    </td>
  );
});

const preventDefault = (e: Event) => e.preventDefault();

export function createRenderers(opts: Required<Option>, ref: any, store: ComponentStore) {
  return (props: any, editor: any, next: () => void): any => {
    switch (props.node.type) {
      case opts.typeContent:
        return <Content attributes={props.attributes}> {props.children}</Content>;
      case opts.typeTable:
        return (
          <Table
            ref={ref}
            editor={editor}
            store={store}
            onInit={updateWidth}
            onUpdate={updateWidth}
            onResizeStop={updateWidth}
            style={opts.tableStyle}
            attributes={props.attributes}
          >
            <tbody {...props.attributes}>{props.children}</tbody>
          </Table>
        );
      case opts.typeRow:
        return (
          <tr
            {...props.attributes}
            style={{ backgroundColor: props.node.data.get('isTitleRow') ? opts.titleColor : null }}
            onDrag={preventDefault}
          >
            {props.children}
          </tr>
        );
      case opts.typeCell:
        return (
          <Cell editor={editor} store={store} node={props.node} attributes={props.attributes} opts={opts}>
            {props.children}
          </Cell>
        );
      default:
        return next();
    }
  };
}
