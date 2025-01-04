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
import { Widget } from '../useDashboard.ts';
import ColumnContainer from './ColumnContainer';

import { useDashboard } from '../useDashboard';
import { useScreenSize } from '../../../DisplayContext';

const WidgetGrid = () => {
  const {
    columns,
    widgets,
    addColumn,
    removeColumn,
    addWidget,
    removeWidget,
    moveWidget,
    setColumns,
    editMode,
    setEditMode,
  } = useDashboard();


  const [activeWidget, setActiveWidget] = useState<Widget | null>(null);
  const { screenSize } = useScreenSize(); // Get screen size


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
  }, [screenSize, setColumns]);

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
      moveWidget(activeId, overId, '');
    }

    // Handle widget to column movement
    if (isActiveWidget && isOverColumn) {
      moveWidget(activeId, '', overId);
    }

    setActiveWidget(null); // Clear active widget after drag ends
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    if (active.data.current?.type === 'Widget') {
      setActiveWidget(widgets.find(widget => widget.id === active.id) || null);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <div className='flex bg-secondary rounded-xl mb-2 gap-4'>
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
              <div className='relative bg-background rounded-md p-4 shadow'>
                <div className='opacity-50'>{activeWidget.content}</div>
              </div>
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </>
  );
};

export default WidgetGrid;