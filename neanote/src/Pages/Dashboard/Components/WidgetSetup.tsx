import React, { useState } from 'react';
import { Button } from '../../../../components/@/ui/button';

interface WidgetSetupProps {
  widgetType: 'Chart' | 'Number' | 'Progress';
  onSave: (config: any) => void;
  onCancel: () => void;
}

export function WidgetSetup({ widgetType, onSave, onCancel }: WidgetSetupProps) {
  const [title, setTitle] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('');

  const handleSave = () => {
    // Save widget config
    onSave({
      type: widgetType,
      title,
      dataSource,
    });
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-bold mb-2">Setup {widgetType} Widget</h2>
      
      <label className="block mt-2">
        Title:
        <input
          className="border rounded-md p-1 w-full mt-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Widget title"
        />
      </label>

      <label className="block mt-4">
        Data Source:
        <select
          className="border rounded-md p-1 w-full mt-1"
          value={dataSource}
          onChange={(e) => setDataSource(e.target.value)}
        >
          <option value="">Select data source</option>
          <option value="note-category-1">Note Category 1</option>
          <option value="note-category-2">Note Category 2</option>
          {/* Add more sources as needed */}
        </select>
      </label>

      <div className="flex justify-end mt-4 gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}