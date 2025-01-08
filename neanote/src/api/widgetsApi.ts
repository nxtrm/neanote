import a from './api';
import { WidgetData, DataSourceResponse, WidgetResponse } from './types/widgetTypes';

const widgetsApi = {
  createUserWidget: async (data: WidgetData) => {
    try {
      const response = await a.post('/api/user_widgets/create', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getUserWidgets: async () => {
    try {
      const response = await a.get<WidgetResponse[]>('/api/user_widgets');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  deleteUserWidget: async (widgetId: string) => {
    try {
      const response = await a.delete(`/api/user_widgets/${widgetId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Add endpoints for widget data sources
  getWidgetDataSources: async (widgetType: string) => {
    try {
      const response = await a.get<DataSourceResponse>(`/api/widgets/datasources/${widgetType}`);
      return { success: true, data: response.data.sources };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

export default widgetsApi;
