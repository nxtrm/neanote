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
  type: 'Chart' | 'Number' | 'Progress';
  onClick: (widgetType: 'Chart' | 'Number' | 'Progress') => void;
}

function WidgetPreviewContainer({ description, title, children, type, onClick }: Props) {
  return (
    <Card
      className='bg-background h-fit rounded-xl m-2 cursor-pointer'
      onClick={() => onClick(type)}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

export default WidgetPreviewContainer;