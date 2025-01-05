import React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../@/ui/chart"
import { chartData } from "../sample_data"

interface ChartWidgetProps {
  label : string,
  color : string,
  sample : boolean,
  data : any

}

export function ChartWidget({label, color, sample, data}: ChartWidgetProps) {

  const chartConfig = {
    completed: {
      label: label,
    },
  } satisfies ChartConfig
  // Resolve theme-dependent color
  const resolvedColor = getComputedStyle(document.documentElement).getPropertyValue(`--color-${color}`).trim() || color;

  return (
    <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
      <BarChart accessibilityLayer data={sample ? chartData : data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="completed" fill={resolvedColor} radius={8} />
      </BarChart>
    </ChartContainer>
  )
}
