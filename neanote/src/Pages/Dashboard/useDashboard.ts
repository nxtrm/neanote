import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { universalApi } from "../../api/universalApi";
import { UniversalType } from "../../api/types/ArchiveTypes";
import { showToast } from "../../../components/Toast";
import { arrayMove } from "@dnd-kit/sortable";
import { WidgetT, WidgetType, DataSourceType } from "../../api/types/widgetTypes";
import widgetsApi from "../../api/widgetsApi";

export interface Column {
  id: string;
  title: string;
}

interface DashboardState {
  getRecents: () => void;
  recents: UniversalType[];
  loading: boolean;
  columns: Column[];
  widgets: WidgetT[];
  setWidgets: (widgets: WidgetT[]) => void;
  editMode: boolean;
  selectedWidgetType: WidgetType | null;
  widgetConfig: { title: string; dataSource: string } | null;
  addColumn: () => void;
  removeColumn: (id: string) => void;
  addWidget: (
    columnId: string,
    widgetId: string,
    type: WidgetType,
    title: string,
    dataSourceType: DataSourceType,
    dataSourceId?: string,
    content?: any
  ) => void;
  removeWidget: (id: string) => void;
  moveWidget: (activeId: string, overId: string, overColumnId: string) => void;
  setColumns: (columns: Column[]) => void;
  setEditMode: (editMode: boolean) => void;
  setSelectedWidgetType: (widgetType: WidgetType | null) => void;
  setWidgetConfig: (config: { title: string; dataSource: string } | null) => void;
  fetchWidgets: () => void;
}

export const useDashboard = create<DashboardState>()(
  immer((set, get) => ({
    recents: [],
    loading: false,
    columns: [],
    widgets: [],
    selectedWidgetType: null,
    widgetConfig: null,
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
    setWidgets: (widgets: WidgetT[]) => {
      set((state) => {
        state.widgets = widgets;
      });
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
        state.editMode = editMode;
      });
    },
    removeColumn: (id: string) => {
      set((state) => {
        state.columns = state.columns.filter((column) => column.id !== id);
        state.widgets = state.widgets.filter((widget) => widget.columnId !== id);
      });
    },
    addWidget: (columnId, widgetId, type, title, dataSourceType, dataSourceId, content = {}) => {
      set((state) => {
        state.widgets.push({
          id: widgetId,
          columnId,
          type,
          title,
          content,
          dataSourceType,
          dataSourceId,
          order: state.widgets.length,
        });
      });
    },
    removeWidget: async (id: string) => {
      try {
        const response = await widgetsApi.deleteUserWidget(id);
        if (response.success) {
          set((state) => {
            state.widgets = state.widgets.filter((widget) => widget.id !== id);
          });
          showToast('success', 'Widget removed successfully');
        } else {
          showToast('error', 'Failed to remove widget');
        }
      } catch (error) {
        showToast('error', 'An error occurred while removing the widget');
      }
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
    setSelectedWidgetType: (widgetType: WidgetType | null) => {
      set((state) => {
        state.selectedWidgetType = widgetType;
      });
    },

    //there is an error at the backend
    fetchWidgets: async () => {
      const response = await widgetsApi.getUserWidgets();
      if (response.success && response.data) {
        set((state) => {
          state.widgets = response.data.map((widget) => ({
            id: widget.id,
            columnId: widget.configuration?.position?.x || "column-1", // Use default column
            type: widget.widget_id,
            title: widget.title || widget.configuration?.title,
            content: widget.source_data, // Use the source_data as the content
            dataSourceType: widget.data_source_type,
            dataSourceId: widget.data_source_id,
            order: widget.configuration?.position?.y || state.widgets.length,
          }));
        });
      } else {
        showToast('error', 'An error occurred while fetching widgets');
      }
    },

    // get widgets is missing???
    setWidgetConfig: (config: { title: string; dataSource: string } | null) => {
      set((state) => {
        state.widgetConfig = config;
      });
    },
  }))
);