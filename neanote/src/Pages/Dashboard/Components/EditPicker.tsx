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
        <div className='flex bg-secondary rounded-xl min-w-full min-h-[40vh] flex-row gap-2'>
          <WidgetContainer title={'Chart'} description='Visualise your task completion rates.'>
            <h1>Sample title</h1>
            <ChartWidget label='Sample' color='destructive' sample={true} data={null}/>
          </WidgetContainer>
          <WidgetContainer title={'Number'} description='Display your streaks and averages.'>
            <NumberWidget caption={'Tasks completed'} number={25}/>
          </WidgetContainer>
        </div>
      </div>
    </DrawerContent>
    </Drawer>
  )
}

export default EditPicker