import a from './api';
import { WidgetData, DataSourceResponse } from './types/widgetTypes';

interface WidgetConfig {
  title: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

interface DataSource {
  id: string;
  title: string;
  type: string;
}

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
      const response = await a.get('/api/user_widgets');
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
