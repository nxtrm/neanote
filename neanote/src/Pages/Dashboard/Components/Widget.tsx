import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Button } from '../../../../components/@/ui/button';
import { ChartWidget } from '../../../../components/Widgets/Chart/ChartWidget';
import { ProgressWidget } from '../../../../components/Widgets/ProgressWidget/ProgressWidget';
import NumberWidget from '../../../../components/Widgets/Number/NumberWidget';
import HabitWeek from '../../../../components/Widgets/HabitWeek/HabitWeek';

interface WidgetProps {
  id: string;
  widgetId: string;
  type:string
  title: string;
  data: any;
  editMode: boolean;
  onRemove: () => void;
}

export const Widget: React.FC<WidgetProps> = ({ id, type, widgetId, title, data, editMode, onRemove }) => {
  // Ensure data exists and has the expected structure
  if (!data) return <div>No data available</div>;

  const renderWidget = () => {
    try {
      switch (type) {
        case 'Chart':
          if (!data.monthly_data) return <div>No chart data available</div>;
          return <ChartWidget 
            label="Completed" 
            color="primary" 
            sample={false}
            data={data.monthly_data} 
          />;
        case 'Progress':
          if (!data.total_milestones) return <div>No progress data available</div>;
          return <ProgressWidget 
            title={title}
            progress={(data.completed_milestones / data.total_milestones) * 100} 
          />;
        case 'Number':
          if (typeof data.streak !== 'number') return <div>No streak data available</div>;
          return <NumberWidget 
            caption={title}
            number={data.streak} 
          />;
        case 'HabitWeek':
          if (!Array.isArray(data.weekly_completions)) return <div>No habit data available</div>;
          return <HabitWeek 
            data={data.weekly_completions} 
          />;
        default:
          return <div>Unsupported widget type: {widgetId}</div>;
      }
    } catch (error) {
      console.error('Error rendering widget:', error);
      return <div>Error rendering widget</div>;
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
