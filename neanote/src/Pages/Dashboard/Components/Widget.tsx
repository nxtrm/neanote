import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Button } from '../../../../components/@/ui/button';
import { ChartWidget } from '../../../../components/Widgets/Chart/ChartWidget';
import { ProgressWidget } from '../../../../components/Widgets/ProgressWidget/ProgressWidget';
import NumberWidget from '../../../../components/Widgets/Number/NumberWidget';
import HabitWeek from '../../../../components/Widgets/HabitWeek/HabitWeek';

interface WidgetProps {
  id: string;
  data: any;
  type: string;
  title: string;
  editMode: boolean;
  onRemove: () => void;
  handleEditClick: (noteId: string, type: string) => void;
}

export const Widget: React.FC<WidgetProps> = ({
  id,
  data,
  type,
  title,
  editMode,
  onRemove,
  handleEditClick
}) => {
  // Render the appropriate widget based on type
  const renderWidget = () => {
    switch (type) {
      case 'Chart':
        return (
          <ChartWidget
            label={title}
            color="primary"
            sample={false}
            data={data?.monthly_data || []}
          />
        );
      case 'Progress':
        const progressValue = data?.completed_milestones !== undefined && 
                             data?.total_milestones !== undefined && 
                             data.total_milestones > 0 
                               ? (data.completed_milestones / data.total_milestones) * 100 
                               : 0;
        return (
          <ProgressWidget
            title={title}
            progress={progressValue}
          />
        );
      case 'Number':
        return (
          <NumberWidget
            caption={title}
            number={data?.value || 0}
          />
        );
      case 'HabitWeek':
        return (
          <HabitWeek
            data={data?.days || [false, false, false, false, false, false, false]}
          />
        );
      default:
        return <div>Unknown widget type: {type}</div>;
    }
  };

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
      {renderWidget()}
    </div>
  );
};