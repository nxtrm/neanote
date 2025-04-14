import React from "react";
import { Progress } from "../../@/ui/progress";

interface ProgressWidgetProps {
  title: string;
  progress: number;
}

export function ProgressWidget({ title, progress }: ProgressWidgetProps) {
  return (
    <div className="p-4  bg-card min-w-[150px] rounded-md shadow-md overflow-clip">
      <h2 className="text-lg font-semibold mb-2 ">{title}</h2>
      <Progress value={progress} />
    </div>
  );
}
