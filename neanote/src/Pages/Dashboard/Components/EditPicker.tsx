import React from 'react';
import { Button } from '../../../../components/@/ui/button';
import { useDashboard } from '../useDashboard';
import { FaPlusCircle } from 'react-icons/fa';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../../../components/@/ui/drawer";
import { ChartWidget } from '../../../../components/Widgets/Chart/ChartWidget';
import { ProgressWidget } from '../../../../components/Widgets/ProgressWidget/ProgressWidget';
import NumberWidget from '../../../../components/Widgets/Number/NumberWidget';
import WidgetPreviewContainer from '../../../../components/Widgets/WidgetPreviewContainer';
import { WidgetSetup } from './WidgetSetup';
import HabitWeek from '../../../../components/Widgets/HabitWeek/HabitWeek';

function EditPicker() {
  const {
    columns,
    addWidget,
    selectedWidgetType,
    setSelectedWidgetType,
    setWidgetConfig,
  } = useDashboard();

  const handleWidgetClick = (widgetType: 'Chart' | 'Number' | 'Progress' | 'HabitWeek') => {
    setSelectedWidgetType(widgetType); // Show setup screen
    setWidgetConfig({ title: '', dataSource: '' }); // Reset widget config
  };

  const handleSave = (config: any) => {
    const columnId = columns[0]?.id || 'column-1';

    addWidget(columnId, config.title, config.type, config.dataSource);

    setSelectedWidgetType(null);
  };

  const handleCancel = () => {
    // Return to widget selection
    setSelectedWidgetType(null);
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>
          <FaPlusCircle />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className='flex flex-row justify-between'>Add widgets</DrawerTitle>
          <DrawerDescription>Select a widget type and source</DrawerDescription>
        </DrawerHeader>

        <div className="mx-auto w-full min-w-full pb-4 px-4">
          {selectedWidgetType === null ? (
            // 1) WIDGET SELECTION GRID
            <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 bg-secondary rounded-xl min-w-full min-h-[40vh]'>
               <WidgetPreviewContainer
                title={'Chart'}
                description='Visualise your task completion rates.'
                type='Chart'
                onClick={handleWidgetClick}
              >
                <ChartWidget label='Sample' color='destructive' sample={true} data={null}/>
              </WidgetPreviewContainer>

              <WidgetPreviewContainer
                title={'Progress'}
                description='Track your progress.'
                type='Progress'
                onClick={handleWidgetClick}
              >
                <ProgressWidget title='Investments' progress={75} />
              </WidgetPreviewContainer>

              <WidgetPreviewContainer
                title={'Number'}
                description='Display your streaks and averages.'
                type='Number'
                onClick={handleWidgetClick}
              >
                <NumberWidget caption={'Habit streak'} number={25}/>
              </WidgetPreviewContainer>

              <WidgetPreviewContainer
                title={'Habit Week'}
                description='View your weekly habit progress.'
                type='HabitWeek'
                onClick={handleWidgetClick}
              >
                <HabitWeek data={[true,true,false,true,true,true,false]}/>
              </WidgetPreviewContainer>

              {/* Add more preview widgets here if needed */}
            </div>
          ) : (
            // 2) SETUP SCREEN
            <WidgetSetup
              widgetType={selectedWidgetType}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default EditPicker;