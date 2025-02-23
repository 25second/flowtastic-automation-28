
export interface Column {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date';
  width?: number;
}

export interface TableData {
  id: string;
  name: string;
  columns: Column[];
  data: any[][];
  cell_status?: boolean[][];
}

export interface TableEditorProps {
  tableId: string;
}

export interface ActiveCell {
  row: number;
  col: number;
}
