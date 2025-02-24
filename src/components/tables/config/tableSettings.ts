
import type { HotTableProps } from '@handsontable/react';
import { TableData } from '../types';

export const createTableSettings = (
  tableData: TableData,
  setTableData: (data: TableData) => void,
  setSelectedCells: (cells: { start: { row: number; col: number }; end: { row: number; col: number } } | null) => void
): Partial<HotTableProps['settings']> => ({
  data: tableData.data,
  colHeaders: tableData.columns.map(col => col.name),
  rowHeaders: true,
  height: '100%',
  licenseKey: 'non-commercial-and-evaluation',
  stretchH: 'all',
  manualColumnResize: true,
  manualRowResize: true,
  contextMenu: false,
  allowInsertRow: true,
  allowInsertColumn: true,
  allowRemoveRow: true,
  allowRemoveColumn: true,
  className: 'htDarkTheme',
  
  // Сортировка
  multiColumnSorting: true,
  
  // Фильтрация
  filters: true,
  dropdownMenu: true,
  
  // Поиск
  search: true,
  
  // Копирование и вставка
  copyPaste: true,
  copyable: true,
  
  // Отмена/повтор действий
  undo: true,
  
  // Автозаполнение и выделение
  fillHandle: {
    autoInsertRow: true,
    direction: 'vertical'
  },
  
  // Объединение ячеек
  mergeCells: true,
  
  // Комментарии к ячейкам
  comments: true,
  
  // Проверка данных
  validator: undefined,
  
  // Автоматическое форматирование
  trimWhitespace: true,
  wordWrap: true,
  
  cells(row: number, col: number) {
    return {
      className: 'border-border p-2',
      type: tableData.columns[col]?.type || 'text',
      renderer: 'html',
    };
  },

  // Стили заголовков
  headerClassName: 'bg-muted text-muted-foreground font-medium',
  
  afterSelection: (row: number, column: number, row2: number, column2: number) => {
    setSelectedCells({
      start: { row: Math.min(row, row2), col: Math.min(column, column2) },
      end: { row: Math.max(row, row2), col: Math.max(column, column2) },
    });
  },
  
  // Основные настройки таблицы
  rowHeights: 40,
  colWidths: 120,
  selectionMode: 'multiple',
  dragToScroll: true,
  outsideClickDeselects: false,
  customBorders: true,
  tableClassName: 'font-sans text-sm',
  
  // Настройки выделения
  currentRowClassName: 'hot-current-row',
  currentColClassName: 'hot-current-col',
  currentHeaderClassName: 'hot-current-header',
  
  // Дополнительные настройки выделения
  selectionHighlight: true,
  
  afterChange: (changes: any) => {
    if (changes) {
      setTableData({
        ...tableData,
        data: tableData.data.map((row, rowIndex) => 
          row.map((cell, colIndex) => {
            const change = changes.find(
              ([changeRow, changeCol]: [number, number]) => 
              changeRow === rowIndex && changeCol === colIndex
            );
            return change ? change[3] : cell;
          })
        )
      });
    }
  }
});
