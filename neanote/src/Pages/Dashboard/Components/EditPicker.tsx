import React from 'react'
import { Button } from '../../../../components/@/ui/button'
import { useDashboard } from '../useDashboard';
import { FaPlusCircle } from 'react-icons/fa';
import { MdEdit,MdOutlineCheck } from "react-icons/md";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../../../components/@/ui/drawer"
import { ChartWidget } from '../../../../components/Widgets/Chart/ChartWidget';
import WidgetContainer from '../../../../components/Widgets/WidgetPreviewContainer';
import NumberWidget from '../../../../components/Widgets/Number/NumberWidget';
import { ProgressWidget } from '../../../../components/Widgets/ProgressWidget/ProgressWidget';
function EditPicker() {
  const {
      columns,
      addWidget,
      addColumn,
      editMode,
      setEditMode
    } = useDashboard();
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>
          <FaPlusCircle />
        </Button>

    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle  className='flex flex-row justify-between'>Add widgets
        </DrawerTitle>
        <DrawerDescription>
          Select a widget type and source
        </DrawerDescription>
      </DrawerHeader>
      <div className="mx-auto w-full min-w-full pb-4 px-4">
        {columns.length > 0 && ( // For debug purposes
          <Button onClick={() => addWidget(columns[0].id)} className='ml-2'>
            <FaPlusCircle /> Add Widget
          </Button>
        )}
        <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 bg-secondary rounded-xl min-w-full min-h-[40vh]'>
          <WidgetContainer title={'Chart'} description='Visualise your task completion rates.'>
            <h1>Tasks completion</h1>
            <ChartWidget label='Sample' color='destructive' sample={true} data={null}/>
          </WidgetContainer>
          <WidgetContainer title={'Number'} description='Display your streaks and averages.'>
            <NumberWidget caption={'Habit streak'} number={25}/>
          </WidgetContainer>
          <WidgetContainer title={'Progress'} description='Track your progress.'>
              <ProgressWidget title='Investments' progress={75} />
            </WidgetContainer>
        </div>
      </div>
    </DrawerContent>
    </Drawer>
  )
}

export default EditPicker