
import { FlowNodeWithData } from '@/types/flow';

export const processReadTableNode = (node: FlowNodeWithData) => {
  const { tableName, columnName, readMode = 'sequential' } = node.data.settings || {};
  return `
    // Read data from table via API
    console.log('Reading from table:', "${tableName}", 'column:', "${columnName}", 'mode:', "${readMode}");
    
    let response;
    // Handle both table name and table ID
    const tableIdentifier = "${tableName}";
    
    if (tableIdentifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // It's a UUID, query by ID
      console.log('Querying table by ID:', tableIdentifier);
      response = await fetch(\`\${process.env.SUPABASE_URL}/functions/v1/table-api\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${process.env.SUPABASE_ANON_KEY}\`,
          'apikey': process.env.SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          tableId: tableIdentifier,
          operation: 'get-table'
        })
      });
    } else {
      // It's a name, use the table name
      console.log('Querying table by name:', tableIdentifier);
      response = await fetch(\`\${process.env.SUPABASE_URL}/functions/v1/table-api\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${process.env.SUPABASE_ANON_KEY}\`,
          'apikey': process.env.SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          tableName: tableIdentifier,
          operation: 'get-table'
        })
      });
    }

    if (!response.ok) {
      const error = await response.json();
      console.error('Error reading table:', error);
      throw new Error('Failed to read from table: ' + (error.error || 'Unknown error'));
    }

    const data = await response.json();
    
    if (data.value === null || data.value === undefined) {
      console.log(data.message || 'No value returned from table');
      return;
    }

    // Store the read value both in global state and node outputs
    global.lastTableRead = data.value;
    global.nodeOutputs["${node.id}"] = {
      value: data.value
    };
    console.log('Read value:', data.value);
  `;
};

export const processWriteTableNode = (node: FlowNodeWithData) => {
  const settings = node.data.settings || {};
  const tableName = settings.tableName || '';
  const columnName = settings.columnName || '';
  const writeMode = settings.writeMode || 'overwrite';
  const data = settings.data || '[]';
  const tags = settings.tags || [];

  return `
    // Write data to table
    console.log('Writing to table:', "${tableName}", 'column:', "${columnName}", 'mode:', "${writeMode}");
    let newData;
    try {
      newData = typeof ${data} === 'string' ? JSON.parse('${data}') : ${data};
    } catch (e) {
      console.error('Invalid data format:', e);
      throw new Error('Invalid data format. Data must be valid JSON array');
    }

    // Determine if tableName is an ID or a name
    const isUUID = "${tableName}".match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    
    const response = await fetch(\`\${process.env.SUPABASE_URL}/functions/v1/table-api\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${process.env.SUPABASE_ANON_KEY}\`,
        'apikey': process.env.SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        tableId: isUUID ? "${tableName}" : null,
        tableName: !isUUID ? "${tableName}" : null,
        data: newData,
        tags: ${JSON.stringify(tags)},
        operation: 'write-table'
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error writing to table:', error);
      throw new Error('Failed to write to table: ' + (error.error || 'Unknown error'));
    }
    
    const result = await response.json();
    console.log('Successfully wrote data to table:', result);
  `;
};

export const processFavoriteTableNode = (node: FlowNodeWithData) => {
  const settings = node.data.settings || {};
  const tableName = settings.tableName || '';
  const isFavorite = settings.isFavorite || false;

  return `
    // Toggle table favorite status
    console.log('Setting favorite status for table:', "${tableName}", 'favorite:', ${isFavorite});
    
    // Determine if tableName is an ID or a name
    const isUUID = "${tableName}".match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    
    const response = await fetch(\`\${process.env.SUPABASE_URL}/functions/v1/table-api\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${process.env.SUPABASE_ANON_KEY}\`,
        'apikey': process.env.SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        tableId: isUUID ? "${tableName}" : null,
        tableName: !isUUID ? "${tableName}" : null,
        is_favorite: ${isFavorite},
        operation: 'update-table-meta'
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error updating table favorite status:', error);
      throw new Error('Failed to update table favorite status: ' + (error.error || 'Unknown error'));
    }
    
    const result = await response.json();
    console.log('Successfully updated table favorite status:', result);
  `;
};
