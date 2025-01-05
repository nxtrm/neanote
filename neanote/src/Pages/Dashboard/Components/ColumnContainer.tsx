import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import { FaPlusCircle, FaTrash } from 'react-icons/fa';
import SortableItem from './SortableItem';
import { Widget } from './Widget';
import { Button } from '../../../../components/@/ui/button';

interface Column {
  id: string;
}

interface Widget {
  id: string;
  columnId: string;
  content: string;
}

interface ColumnContainerProps {
  column: Column;
  widgets: Widget[];
  addWidget: (columnId: string) => void;
  removeWidget: (id: string) => void;
  editMode: boolean;
  removeColumn: (id: string) => void;
}

const ColumnContainer: React.FC<ColumnContainerProps> = ({
  column,
  widgets,
  addWidget,
  removeWidget,
  editMode,
  removeColumn,
}) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
    disabled: !editMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className='bg-secondary rounded-xl p-2 min-h-[70vh] w-[300px]'>

      <SortableContext items={widgets.map((widget) => widget.id)}>
        <div className='flex flex-grow flex-col gap-2'>
          {widgets.map((widget) => (
            <SortableItem key={widget.id} id={widget.id} editMode={editMode}>
              <Widget
                id={widget.id}
                data={widget.content}
                editMode={editMode}
                onRemove={() => removeWidget(widget.id)}
                handleEditClick={() => console.log('Edit')}
              />
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default ColumnContainer;