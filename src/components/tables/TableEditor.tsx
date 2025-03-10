
import React, { useEffect, useState } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import "handsontable/dist/handsontable.full.min.css";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TableData, Column } from './types';
import { Save, ArrowLeft, Download, Upload } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';

// Register Handsontable modules
registerAllModules();

interface TableEditorProps {
  tableId: string;
}

export function TableEditor({ tableId: propTableId }: TableEditorProps) {
  const params = useParams();
  const tableId = propTableId || params.tableId; // Try to get tableId from props or URL params
  
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (tableId) {
      console.log("TableEditor mounted with tableId:", tableId);
      loadTableData();
    } else {
      console.error("No tableId provided");
      toast.error('Идентификатор таблицы не указан');
      setLoading(false);
    }
  }, [tableId]);

  const loadTableData = async () => {
    try {
      setLoading(true);
      console.log("Loading table data for ID:", tableId);
      
      // First, try to get the table by ID
      const { data, error } = await supabase
        .from('custom_tables')
        .select('*')
        .eq('id', tableId)
        .maybeSingle();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (!data) {
        console.error("No data returned for table ID:", tableId);
        toast.error('Таблица не найдена');
        setLoading(false);
        return;
      }

      console.log("Received table data:", data);

      const columns = Array.isArray(data.columns) 
        ? data.columns.map((col: any): Column => ({
            id: col.id || '',
            name: col.name || '',
            type: col.type || 'text',
            width: col.width
          }))
        : [];

      // Safe conversion of JSON data to proper format
      let tableRows: any[][] = [];
      if (Array.isArray(data.data)) {
        tableRows = data.data as any[][];
      }

      // Safe conversion of cell_status
      let cellStatus: boolean[][] = [];
      if (Array.isArray(data.cell_status)) {
        cellStatus = data.cell_status as boolean[][];
      }

      const parsedData: TableData = {
        id: data.id,
        name: data.name,
        columns: columns,
        data: tableRows,
        cell_status: cellStatus
      };

      setTableData(parsedData);
    } catch (error) {
      console.error('Error loading table:', error);
      toast.error('Ошибка при загрузке таблицы');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tableData || !tableId) return;

    try {
      const { error } = await supabase
        .from('custom_tables')
        .update({
          data: tableData.data,
          updated_at: new Date().toISOString()
        })
        .eq('id', tableId);

      if (error) throw error;

      toast.success('Таблица сохранена');
    } catch (error) {
      console.error('Error saving table:', error);
      toast.error('Ошибка при сохранении таблицы');
    }
  };

  const exportToExcel = () => {
    if (!tableData) return;
    
    const ws = XLSX.utils.aoa_to_sheet(
      [
        tableData.columns.map(col => col.name),
        ...tableData.data
      ]
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${tableData.name}.xlsx`);
    toast.success('Таблица экспортирована в Excel');
  };

  const exportToCSV = () => {
    if (!tableData) return;
    
    const ws = XLSX.utils.aoa_to_sheet(
      [
        tableData.columns.map(col => col.name),
        ...tableData.data
      ]
    );
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${tableData.name}.csv`;
    link.click();
    toast.success('Таблица экспортирована в CSV');
  };

  const importFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !tableData) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        if (rows[0].length !== tableData.columns.length) {
          toast.error('Количество столбцов в импортируемом файле не совпадает с текущей таблицей');
          return;
        }

        setTableData({
          ...tableData,
          data: rows.slice(1)
        });
        toast.success('Данные импортированы успешно');
      } catch (error) {
        console.error('Error importing file:', error);
        toast.error('Ошибка при импорте файла');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (!tableData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-destructive">Таблица не найдена</div>
      </div>
    );
  }

  const hotSettings = {
    data: tableData.data,
    colHeaders: tableData.columns.map(col => col.name),
    rowHeaders: true,
    height: 'auto',
    licenseKey: 'non-commercial-and-evaluation',
    stretchH: 'all' as const,
    contextMenu: true,
    manualColumnResize: true,
    manualRowResize: true,
    allowInsertRow: true,
    allowInsertColumn: true,
    allowRemoveRow: true,
    allowRemoveColumn: true,
    afterChange: (changes: any) => {
      if (changes) {
        setTableData(prev => {
          if (!prev) return prev;
          const newData = [...prev.data];
          changes.forEach(([row, col, oldValue, newValue]: [number, number, any, any]) => {
            if (row < newData.length) {
              if (!newData[row]) newData[row] = [];
              newData[row][col] = newValue;
            }
          });
          return { ...prev, data: newData };
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/tables')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-2xl font-semibold">{tableData.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept=".xlsx,.csv"
              onChange={importFile}
            />
            <Button 
              variant="outline"
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Импорт
            </Button>
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="w-4 h-4 mr-2" />
              XLSX
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full overflow-auto">
        <HotTable settings={hotSettings} />
      </div>
    </div>
  );
}
