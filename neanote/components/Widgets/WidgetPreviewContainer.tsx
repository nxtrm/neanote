import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "../@/ui/card"

interface Props {
    title:string;
    description:string;
    children: React.ReactNode
}
// add clickability to the container to add the widget
function WidgetPreviewContainer({description,title , children}: Props) {
  return (
    <Card className='bg-background h-fit rounded-xl m-2 '>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
        </Card>
  )
}

export default WidgetPreviewContainer