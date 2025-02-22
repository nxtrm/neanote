import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Button } from '../../../../components/@/ui/button';
import { ChartWidget } from '../../../../components/Widgets/Chart/ChartWidget';

interface WidgetProps {
  id: string;
  data: any;
  editMode: boolean;
  onRemove: () => void;
  handleEditClick: (noteId: string, type: string) => void;
}

export const Widget: React.FC<WidgetProps> = ({ id, data, editMode, onRemove, handleEditClick }) => {
  return (
    <div className='relative min-h-50 bg-background rounded-md p-4 shadow'>
      {editMode && (
        <Button
          onClick={onRemove}
          className='absolute h-10 w-10 top-2 right-2 text-red-500'
          variant='ghost'
        >
          <FaTrash />
        </Button>
      )}
      {/* add widget dynanically here */}

    </div>
  );
};