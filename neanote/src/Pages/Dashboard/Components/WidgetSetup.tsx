import React, { useState, useEffect } from 'react';
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
import widgetsApi from '../../../api/widgetsApi';
import { WidgetType, DataSource, WidgetData } from '../../../api/types/widgetTypes';

interface WidgetSetupProps {
  widgetType: WidgetType;
  onSave: (config: WidgetData) => void;
  onCancel: () => void;
}

export function WidgetSetup({ widgetType, onSave, onCancel }: WidgetSetupProps) {
  const [title, setTitle] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('');
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDataSources = async () => {
      const response = await widgetsApi.getWidgetDataSources(widgetType);
      if (response.success) {
        if (response.data) {
          setDataSources(response.data);
        }
      }
      setLoading(false);
    };
    fetchDataSources();
  }, [widgetType]);

  const handleDataSourceChange = (value: string) => {
    setDataSource(value);
  };

  const handleSave = async () => {
    if (!title || !dataSource) {
      return;
    }
    const selectedSource = dataSources.find(ds => ds.id === dataSource);
    if (!selectedSource) return;

    const widgetData: WidgetData = {
      widget_id: widgetType,
      data_source_type: selectedSource.type as DataSourceType, // Cast to avoid mismatch
      data_source_id: selectedSource.id,
      configuration: {
        title,
        position: { x: 0, y: 0 },
      }
    };

    onSave(widgetData);
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
        placeholder="Widget title"
        required
        />

        <Select
            value={dataSource}
            onValueChange={handleDataSourceChange}
            disabled={loading}
            >
        <SelectTrigger>
            <SelectValue placeholder="Select a data source" />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                <SelectLabel>Data sources</SelectLabel>
                {dataSources.map(source => (
                <SelectItem key={source.id} value={source.id}>
                    {source.title}
                </SelectItem>
                ))}
            </SelectGroup>
        </SelectContent>
        </Select>
     </div>

      <div className="flex justify-end mt-4 gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={!title} onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}