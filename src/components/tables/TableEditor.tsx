
import React, { useEffect, useRef, useState } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import "handsontable/dist/handsontable.full.min.css";
import { useNavigate } from 'react-router-dom';
import { TableData } from './types';
import { useTableOperations } from './hooks/useTableOperations';
import { useTableModifications } from './hooks/useTableModifications';
import { useContextMenuOperations } from './hooks/useContextMenuOperations';
import { TableToolbar } from './TableToolbar';
import { TableContextMenu } from './TableContextMenu';

// Register Handsontable modules
registerAllModules();

interface TableEditorProps {
  tableId: string;
}

export function TableEditor({ tableId }: TableEditorProps) {
  const navigate = useNavigate();
  const hotTableRef = useRef<any>(null);
  const [selectedCells, setSelectedCells] = useState<{
    start: { row: number; col: number };
    end: { row: number; col: number };
  } | null>(null);

  const { tableData, setTableData, loading, loadTableData, handleSave } = useTableOperations(tableId);
  const { handleAddRow, handleAddColumn, exportToCsv, exportToXlsx, importFile } = useTableModifications(tableData, setTableData);
  const contextMenuOperations = useContextMenuOperations(hotTableRef, selectedCells);

  useEffect(() => {
    loadTableData();
  }, [tableId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (!tableData) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-destructive">Таблица не найдена</div>
      </div>
    );
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFile(file);
    }
  };

  const hotSettings = {
    data: tableData.data,
    colHeaders: tableData.columns.map(col => col.name),
    rowHeaders: true,
    height: '100%',
    licenseKey: 'non-commercial-and-evaluation',
    stretchH: 'all' as const,
    manualColumnResize: true,
    manualRowResize: true,
    contextMenu: false,
    allowInsertRow: true,
    allowInsertColumn: true,
    allowRemoveRow: true,
    allowRemoveColumn: true,
    className: 'htDarkTheme',
    headerTooltips: true,
    
    // Добавляем сортировку
    columnSorting: true,
    multiColumnSorting: true, // Сортировка по нескольким столбцам
    
    // Добавляем фильтрацию
    filters: true,
    dropdownMenu: true, // Меню для фильтрации
    
    // Форматирование текста
    cell: [
      {
        renderer: 'html', // Позволяет использовать HTML в ячейках
      }
    ],
    
    // Поиск
    search: true,
    
    // Копирование и вставка
    copyPaste: true,
    copyable: true,
    
    // Отмена/повтор действий
    undo: true,
    
    // Автозаполнение
    fillHandle: {
      autoInsertRow: true,
      direction: 'vertical' as const,
    },
    
    // Объединение ячеек
    mergeCells: true,
    
    // Комментарии к ячейкам
    comments: true,
    
    // Проверка данных
    validator: false,
    
    // Горячие клавиши
    shortcuts: {
      cells: true,
      vertical: true,
      horizontal: true,
    },
    
    // Автоматическое форматирование
    trimWhitespace: true,
    wordWrap: true,
    
    cells: function(row: number, col: number) {
      return {
        className: 'border-border',
        // Добавляем типы данных для столбцов
        type: tableData.columns[col]?.type || 'text',
      };
    },
    
    headerStyle: {
      background: 'hsl(var(--muted))',
      color: 'hsl(var(--muted-foreground))',
      fontWeight: '500',
    },
    
    afterSelection: (row: number, column: number, row2: number, column2: number) => {
      setSelectedCells({
        start: { row: Math.min(row, row2), col: Math.min(column, column2) },
        end: { row: Math.max(row, row2), col: Math.max(column, column2) },
      });
    },
    
    rowHeights: 40,
    colWidths: 120,
    selectionMode: 'multiple' as const,
    dragToScroll: true,
    fillHandle: true,
    selectionStyle: {
      background: 'hsla(var(--primary), 0.1)',
      border: {
        width: 2,
        color: 'hsl(var(--primary))'
      }
    },
    outsideClickDeselects: false,
    customBorders: true,
    tableClassName: 'font-sans text-sm',
    cellPadding: 8,
    currentRowClassName: 'bg-muted',
    currentColClassName: 'bg-muted',
    afterChange: (changes: any) => {
      if (changes) {
        setTableData(prev => {
          if (!prev) return prev;
          const newData = [...prev.data];
          changes.forEach(([row, col, oldValue, newValue]: [number, number, any, any]) => {
            newData[row][col] = newValue;
          });
          return { ...prev, data: newData };
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TableToolbar
        tableName={tableData.name}
        onNavigateBack={() => navigate('/tables')}
        onAddRow={handleAddRow}
        onAddColumn={handleAddColumn}
        onExportCsv={exportToCsv}
        onExportXlsx={exportToXlsx}
        onImport={handleImport}
        onSave={handleSave}
      />

      <div className="flex-1 overflow-hidden">
        <TableContextMenu 
          onCopy={contextMenuOperations.handleCopy}
          onCut={contextMenuOperations.handleCut}
          onPaste={contextMenuOperations.handlePaste}
          onDeleteCells={contextMenuOperations.handleDeleteCells}
          onInsertRowAbove={contextMenuOperations.handleInsertRowAbove}
          onInsertRowBelow={contextMenuOperations.handleInsertRowBelow}
          onRemoveRow={contextMenuOperations.handleRemoveRow}
          onInsertColLeft={contextMenuOperations.handleInsertColLeft}
          onInsertColRight={contextMenuOperations.handleInsertColRight}
          onRemoveCol={contextMenuOperations.handleRemoveCol}
        >
          <div className="h-full">
            <style>
              {`
                .handsontable {
                  font-family: var(--font-sans);
                  color: hsl(var(--foreground));
                  height: 100% !important;
                }
                
                .handsontable th {
                  background-color: hsl(var(--muted));
                  color: hsl(var(--muted-foreground));
                  font-weight: 500;
                }

                .handsontable td {
                  background-color: hsl(var(--background));
                  border-color: hsl(var(--border));
                }

                .handsontable td.current {
                  background-color: hsla(var(--primary), 0.1);
                }

                .handsontable tr:hover td {
                  background-color: hsl(var(--muted));
                }

                .handsontable .wtBorder.current {
                  background-color: hsl(var(--primary)) !important;
                }

                .handsontable .wtBorder.area {
                  background-color: hsl(var(--primary)) !important;
                }

                .handsontable .columnSorting:hover {
                  color: hsl(var(--primary));
                }

                .wtHolder {
                  height: 100% !important;
                }

                /* Стили для выделения */
                .handsontable .area {
                  background-color: hsla(var(--primary), 0.1) !important;
                }
                
                .handsontable .area-selection {
                  border: 2px solid hsl(var(--primary)) !important;
                }

                /* Стили для меню фильтрации и сортировки */
                .handsontable .htFiltersMenuCondition {
                  background: hsl(var(--background));
                  border-color: hsl(var(--border));
                }

                .handsontable .htFiltersMenuCondition .htUIInput {
                  background-color: hsl(var(--background));
                  border-color: hsl(var(--border));
                  color: hsl(var(--foreground));
                }

                .handsontable .htFiltersMenuCondition .htUISelectButton {
                  background-color: hsl(var(--background));
                  border-color: hsl(var(--border));
                  color: hsl(var(--foreground));
                }

                /* Стили для комментариев */
                .htCommentTextArea {
                  background-color: hsl(var(--background));
                  border-color: hsl(var(--border));
                  color: hsl(var(--foreground));
                }

                /* Стили для выпадающего меню */
                .htDropdownMenu {
                  background: hsl(var(--background));
                  border-color: hsl(var(--border));
                  color: hsl(var(--foreground));
                }

                .htDropdownMenu .htItemWrapper {
                  color: hsl(var(--foreground));
                }

                .htDropdownMenu .htItemWrapper:hover {
                  background: hsl(var(--accent));
                }
              `}
            </style>
            <HotTable settings={hotSettings} ref={hotTableRef} />
          </div>
        </TableContextMenu>
      </div>
    </div>
  );
}
