
import { useEffect } from 'react';
import { useTableLoading } from './useTableLoading';
import { useTableSelection } from './useTableSelection';
import { useColumnEditing } from './useColumnEditing';
import { useCellEditing } from './useCellEditing';
import { useClipboard } from './useClipboard';
import { useTableOperations } from './useTableOperations';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export { MIN_COLUMN_WIDTH } from './constants';

export const useTableState = (tableId: string) => {
  const { table, setTable, loading } = useTableLoading(tableId);
  
  const {
    activeCell,
    setActiveCell,
    selection,
    setSelection,
    handleCellMouseDown,
    handleCellMouseOver,
    handleCellMouseUp,
    handleCellClick
  } = useTableSelection();

  const {
    editingColumnId,
    editingColumnName,
    setEditingColumnName,
    handleColumnHeaderClick,
    handleColumnNameChange,
    handleResizeStart
  } = useColumnEditing(tableId, table, setTable);

  const {
    editValue,
    setEditValue,
    handleCellChange
  } = useCellEditing(tableId, table, setTable);

  const { handleCopy, handlePaste } = useClipboard(table, activeCell, selection, tableId);
  const { addRow, addColumn, exportTable, importTable } = useTableOperations(tableId, table, setTable);

  const handleClear = async () => {
    if (!table) return;

    try {
      if (selection) {
        const startRow = Math.min(selection.start.row, selection.end.row);
        const endRow = Math.max(selection.start.row, selection.end.row);
        const startCol = Math.min(selection.start.col, selection.end.col);
        const endCol = Math.max(selection.start.col, selection.end.col);

        const newData = [...table.data];
        for (let i = startRow; i <= endRow; i++) {
          for (let j = startCol; j <= endCol; j++) {
            newData[i][j] = '';
          }
        }

        const { error } = await supabase
          .from('custom_tables')
          .update({ data: newData })
          .eq('id', tableId);

        if (error) throw error;

        setTable(prevTable => prevTable ? { ...prevTable, data: newData } : null);
        toast.success('Ячейки очищены');
      } else if (activeCell) {
        const newData = [...table.data];
        newData[activeCell.row][activeCell.col] = '';

        const { error } = await supabase
          .from('custom_tables')
          .update({ data: newData })
          .eq('id', tableId);

        if (error) throw error;

        setTable(prevTable => prevTable ? { ...prevTable, data: newData } : null);
        toast.success('Ячейка очищена');
      }
    } catch (error) {
      console.error('Clear operation error:', error);
      toast.error('Ошибка при очистке');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!table || (!activeCell && !selection)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        console.log('Copy shortcut detected');
        e.preventDefault();
        handleCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        console.log('Paste shortcut detected');
        e.preventDefault();
        handlePaste().then((newData) => {
          if (newData) {
            setTable(prevTable => prevTable ? { ...prevTable, data: newData } : null);
          }
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [table, activeCell, selection, handleCopy, handlePaste]);

  return {
    table,
    loading,
    activeCell,
    editValue,
    editingColumnId,
    editingColumnName,
    selection,
    setEditValue,
    handleCellClick,
    handleCellMouseDown,
    handleCellMouseOver,
    handleCellMouseUp,
    handleColumnHeaderClick,
    handleColumnNameChange,
    handleCellChange,
    handleResizeStart,
    handleCopy,
    handlePaste,
    handleClear,
    addRow,
    addColumn,
    exportTable,
    importTable
  };
};
