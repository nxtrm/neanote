import React, { useState } from 'react';
import { Button } from '../../../../components/@/ui/button';
import { Label } from '../../../../components/@/ui/label';
import {Input } from '../../../../components/@/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "../../../../components/@/ui/select"

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

        <Label className="mt-2 flex py-1 flex-col">
            Title:
        </Label>
      <div className='flex flex-row gap-2'>
        <Input
        className="border rounded-md p-1"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Widget title"/>

        <Select
            value={dataSource}
            >
        <SelectTrigger>
            <SelectValue placeholder="Select a data source" />
        </SelectTrigger>
        <SelectContent onChange={(e) => setDataSource((e.target as HTMLSelectElement).value)}>
            <SelectGroup>
                <SelectLabel>Data sources</SelectLabel>
                <SelectItem value="note-category-1">Note Category 1</SelectItem>
                <SelectItem value="note-category-2">Note Category 2</SelectItem>
                {/* Add more sources */}
            </SelectGroup>
        </SelectContent>
        </Select>
     </div>

      <div className="flex justify-end mt-4 gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}