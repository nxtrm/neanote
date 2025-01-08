import React, { createContext, useContext, useState } from 'react';
import { WidgetT } from '../../api/types/widgetTypes';
import { Column } from './useDashboard';

interface DashboardContextType {
  columns: Column[];
  widgets: WidgetT[];
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  setColumns: (columns: Column[]) => void;
  setWidgets: (widgets: WidgetT[]) => void;
  addWidget: (widget: WidgetT) => void;
  removeWidget: (widgetId: string) => void;
  moveWidget: (widgetId: string, overId: string, columnId: string) => void;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [widgets, setWidgets] = useState<WidgetT[]>([]);
  const [editMode, setEditMode] = useState(false);

  const addWidget = (widget: WidgetT) => {
    setWidgets(prev => [...prev, widget]);
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  const moveWidget = (widgetId: string, overId: string, columnId: string) => {
    setWidgets(prev => {
      const widgets = [...prev];
      const widgetIndex = widgets.findIndex(w => w.id === widgetId);
      const widget = widgets[widgetIndex];

      if (!widget) return prev;

      // Remove widget from current position
      widgets.splice(widgetIndex, 1);

      if (columnId) {
        // Moving to a new column
        widget.columnId = columnId;
        widgets.push(widget);
      } else if (overId) {
        // Moving within same column or between widgets
        const overIndex = widgets.findIndex(w => w.id === overId);
        widgets.splice(overIndex, 0, widget);
      }

      // Update order values
      return widgets.map((w, index) => ({
        ...w,
        order: index
      }));
    });
  };

  const value = {
    columns,
    widgets,
    editMode,
    setEditMode,
    setColumns,
    setWidgets,
    addWidget,
    removeWidget,
    moveWidget,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
