import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "../../../../components/@/lib/utils"
import { Button } from "../../../../components/@/ui/button"
import { Calendar } from "../../../../components/@/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/@/ui/popover"
import { Input } from "../../../../components/@/ui/input"
import { useState, useEffect } from "react"

interface DatePickerProps {
  onDateChange: (newDate: Date | undefined) => void;
  data?: Date;
  includeTime?: boolean;
}

export function DatePicker({ onDateChange, data, includeTime = false }: DatePickerProps) {
  const [dateTime, setDateTime] = useState<Date | undefined>(data);

  useEffect(() => {
    if (data instanceof Date && !isNaN(data.getTime())) {
      setDateTime(data);
    } else {
      setDateTime(undefined);
    }
    console.log(data)
  }, [data]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate && dateTime) {
      newDate.setHours(dateTime.getHours(), dateTime.getMinutes());
    }
    setDateTime(newDate);
    onDateChange(newDate || undefined);
  };

  const handleTimeSelect = (timeString: string) => {
    const timeParts = timeString.split(':').map(Number);
    const newDateTime = dateTime ? new Date(dateTime) : new Date();

    if (timeParts.length === 2) {
      newDateTime.setHours(timeParts[0], timeParts[1]);
      setDateTime(newDateTime);
      onDateChange(newDateTime);
    }
  };

  const handleClear = () => {
    setDateTime(undefined);
    onDateChange(undefined);
  };

  const formattedTime = (dateTime && includeTime) ? format(dateTime, "HH:mm") : "";

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-[150px] justify-start text-left font-normal", !dateTime && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateTime ? format(dateTime, "PPP") : <span>Reminder</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dateTime}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="flex flex-row gap-3 p-3">
            <Button className="w-1/4 items-center" variant="secondary" onClick={handleClear}>Clear</Button>
            {includeTime && (
              <Input
                type="time"
                value={formattedTime}
                onChange={(e) => handleTimeSelect(e.target.value)}
                className="w-3/4 justify-center"
              />
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}