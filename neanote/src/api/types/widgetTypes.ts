export type WidgetType = 'Chart' | 'Number' | 'Progress' | 'HabitWeek';
export type DataSourceType = 'task' | 'habit' | 'goal';

export interface WidgetConfig {
  title: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface WidgetT {
  id: string;
  columnId: string;
  content: {
    monthly_data?: Array<{ month: string; completed: number }>;
    total_milestones?: number;
    completed_milestones?: number;
    streak?: number;
    weekly_completions?: boolean[];
  };
  order: number;
  type: WidgetType;
  title: string;
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

export interface WidgetResponse {
  id: number;
  widget_id: WidgetType;
  title: string;
  data_source_type: DataSourceType;
  data_source_id: string;
  configuration: {
    title: string;
    position: { x: number; y: number };
  };
  source_data: {
    monthly_data?: Array<{ month: string; completed: number }>;
    total_milestones?: number;
    completed_milestones?: number;
    streak?: number;
    weekly_completions?: boolean[];
  };
}