import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../@/ui/card";

interface Props {
  title: string;
  description: string;
  children: React.ReactNode;
  type: 'Chart' | 'Number' | 'Progress' | 'HabitWeek';
  onClick: (widgetType: 'Chart' | 'Number' | 'Progress' | 'HabitWeek') => void;
}

function WidgetPreviewContainer({ description, title, children, type, onClick }: Props) {
  return (
    <Card
      className='bg-background h-fit rounded-xl m-2 cursor-pointer'
      onClick={() => onClick(type)}
    >
      <CardHeader>
        <CardTitle className='max-w-[200px] overflow-ellipsis'>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

export default WidgetPreviewContainer;