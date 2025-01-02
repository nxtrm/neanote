import {
    closestCenter,
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
  } from '@dnd-kit/core';
  import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
  } from '@dnd-kit/sortable';
  import React, { useEffect, useMemo, useState } from 'react';
  import { createPortal } from 'react-dom';
  import { FaPlusCircle } from 'react-icons/fa';
  import { Button } from '../../../../components/@/ui/button';
  import SortableItem from './SortableItem';
  import { Widget } from './Widget';
  import ColumnContainer from './ColumnContainer.tsx';
import { useScreenSize } from '../../../DisplayContext.tsx';

  interface Column {
    id: string;
  }

  interface Widget {
    id: string;
    columnId: string;
    content: string;
  }

  const WidgetGrid = () => {
    const [editMode, setEditMode] = useState(false);
    const [columns, setColumns] = useState<Column[]>([]);
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [activeWidget, setActiveWidget] = useState<Widget | null>(null);
    var { screenSize } = useScreenSize()

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 5,
        },
      })
    );
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    useEffect(() => {
        const determineColumns = () => {
          let numColumns;
          if (screenSize === 'small') {
            numColumns = 2;
          } else if (screenSize === 'medium') {
            numColumns = 3;
          } else {
            numColumns = 6;
          }

          const initialColumns = Array.from({ length: numColumns }, (_, index) => ({
            id: `column-${index + 1}`,
            title: `Column ${index + 1}`,
          }));

          setColumns(initialColumns);
        };

        determineColumns();
      }, [screenSize]);

      const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveWidget = active.data.current?.type === 'Widget';
        const isOverWidget = over.data.current?.type === 'Widget';
        const isOverColumn = over.data.current?.type === 'Column';

        // Handle widget to widget movement
        if (isActiveWidget && isOverWidget) {
          setWidgets((prevWidgets) => {
            const activeIndex = prevWidgets.findIndex((widget) => widget.id === activeId);
            const overIndex = prevWidgets.findIndex((widget) => widget.id === overId);

            if (activeIndex === -1 || overIndex === -1) return prevWidgets;

            // If moving to a different column
            if (prevWidgets[activeIndex].columnId !== prevWidgets[overIndex].columnId) {
              prevWidgets[activeIndex].columnId = prevWidgets[overIndex].columnId;
            }

            return arrayMove(prevWidgets, activeIndex, overIndex);
          });
        }

        // Handle widget to column movement
        if (isActiveWidget && isOverColumn) {
          setWidgets((prevWidgets) => {
            const activeIndex = prevWidgets.findIndex((widget) => widget.id === activeId);
            if (activeIndex === -1) return prevWidgets;

            const updatedWidgets = [...prevWidgets];
            updatedWidgets[activeIndex] = {
              ...updatedWidgets[activeIndex],
              columnId: overId,
            };
            return updatedWidgets;
          });
        }

        setActiveWidget(null); // Clear active widget after drag ends
      };



    const removeColumn = (id: string) => {
      setColumns(columns.filter((column) => column.id !== id));
      setWidgets(widgets.filter((widget) => widget.columnId !== id));
    };

    const addWidget = (columnId: string) => {
      const newWidgetId = `widget-${Date.now()}`;
      const newWidget: Widget = {
        id: newWidgetId,
        columnId,
        content: `Widget ${widgets.length + 1}`,
      };
      setWidgets([...widgets, newWidget]);
    };

    const removeWidget = (id: string) => {
      setWidgets(widgets.filter((widget) => widget.id !== id));
    };

    return (
      <>
        <div className='flex justify-end mb-2'>
          <Button onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Done' : 'Edit'}
          </Button>
          {editMode && (
            <Button onClick={()=> addWidget(columns[0].id)} className='ml-2'>
              <FaPlusCircle />  Add Widget
            </Button>
          )}
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragStart={(event) => {
            if (event.active.data.current?.type === 'Widget') {
              setActiveWidget(event.active.data.current.widget);
            }
          }}
        >
          <div className='flex bg-secondary rounded-md my-2 gap-4'>
            <SortableContext items={columnsId} strategy={rectSortingStrategy}>
              {columns.map((column) => (
                <ColumnContainer
                  key={column.id}
                  column={column}
                  widgets={widgets.filter((widget) => widget.columnId === column.id)}
                  addWidget={addWidget}
                  removeWidget={removeWidget}
                  editMode={editMode}
                  removeColumn={removeColumn}
                />
              ))}
            </SortableContext>
          </div>
          {createPortal(
            <DragOverlay>
              {activeWidget && (
                <Widget
                  id={activeWidget.id}
                  data={activeWidget.content}
                  editMode={editMode}
                  onRemove={() => removeWidget(activeWidget.id)}
                  handleEditClick={() => console.log('Edit')}
                />
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </>
    );
  };

  export default WidgetGrid;