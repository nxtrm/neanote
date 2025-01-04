
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { universalApi } from "../../api/universalApi";
import { UniversalType } from "../../api/types/ArchiveTypes";
import { showToast } from "../../../components/Toast";
import { arrayMove } from "@dnd-kit/sortable";

export interface Column {
    id: string;
    title: string;
  }
  
export interface Widget {
    id: string;
    columnId: string;
    content: string;
  }

interface DashboardState {
    getRecents: () => void;
    recents: UniversalType[];
    loading: boolean;
    columns: Column[];
    widgets: Widget[];
    addColumn: () => void;
    removeColumn: (id: string) => void;
    addWidget: (columnId: string) => void;
    removeWidget: (id: string) => void;
    moveWidget: (activeId: string, overId: string, overColumnId: string) => void;
    setColumns: (columns: Column[]) => void;
    editMode: boolean;
    setEditMode: (editMode: boolean) => void;
  }

export const useDashboard = create<DashboardState>()(
    immer((set, get) => ({
      recents: [],
      loading: false,
      columns: [],
      widgets: [],
      editMode: false,
      getRecents: async () => {
        const response = await universalApi.getRecents();
        if (response && response.success) {
          set((state) => {
            state.recents = response.data.data;
          });
        } else {
          showToast('error', 'An error occurred while fetching recently accessed notes.');
        }
      },

    addColumn: () => {
        const newColumnId = `column-${Date.now()}`;
        const newColumn: Column = {
          id: newColumnId,
          title: `Column ${get().columns.length + 1}`,
        };
        set((state) => {
          state.columns.push(newColumn);
        });
      },

    setEditMode: (editMode: boolean) => {
        set((state) => {
          state.editMode = editMode
      })},

    removeColumn: (id: string) => {
        set((state) => {
          state.columns = state.columns.filter((column) => column.id !== id);
          state.widgets = state.widgets.filter((widget) => widget.columnId !== id);
        });
      },
    addWidget: (columnId: string) => {
        const newWidgetId = `widget-${Date.now()}`;
        const newWidget: Widget = {
          id: newWidgetId,
          columnId,
          content: `Widget ${get().widgets.length + 1}`,
        };
        set((state) => {
          state.widgets.push(newWidget);
        });
      },
    removeWidget: (id: string) => {
        set((state) => {
          state.widgets = state.widgets.filter((widget) => widget.id !== id);
        });
      },
    moveWidget: (activeId: string, overId: string, overColumnId: string) => {
        set((state) => {
          const activeIndex = state.widgets.findIndex((widget) => widget.id === activeId);
          const overIndex = state.widgets.findIndex((widget) => widget.id === overId);
  
          if (activeIndex === -1) return;
  
          if (overIndex === -1) {
            state.widgets[activeIndex].columnId = overColumnId;
          } else {
            state.widgets[activeIndex].columnId = state.widgets[overIndex].columnId;
            state.widgets = arrayMove(state.widgets, activeIndex, overIndex);
          }
        });
      },
    setColumns: (columns: Column[]) => {
        set((state) => {
          state.columns = columns;
        });
      },
    }))
  );