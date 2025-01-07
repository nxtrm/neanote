export type WidgetType = 'Chart' | 'Number' | 'Progress' | 'HabitWeek';
export type DataSourceType = 'task' | 'habit' | 'goal';

export interface WidgetConfig {
  title: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface Widget {
  id: string;
  columnId: string;
  type: WidgetType;
  title: string;
  content: string;
  dataSourceType: DataSourceType;
  dataSourceId?: string;
}

export interface WidgetData {
  widget_id: WidgetType;
  data_source_type: DataSourceType;
  data_source_id?: string;
  configuration: WidgetConfig;
}

export interface DataSource {
  id: string;
  title: string;
  type: DataSourceType;
}

export interface DataSourceResponse {
  sources: DataSource[];
}
