"use client"

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

interface DatePickerProps {
  onDateChange: (newDate: Date | undefined) => void;
  data ?: Date | undefined;
  includeTime?: boolean; // Optional prop to include time picker
}

export function DatePicker({ onDateChange, data, includeTime = false }: DatePickerProps) {
  const [dateTime, setDateTime] = React.useState<Date | undefined>()

  React.useEffect(() => {
    if (data) {
      const parsedDate = new Date(data);
      setDateTime(parsedDate);
    }
  }, [data]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate && dateTime) {
      newDate.setHours(dateTime.getHours(), dateTime.getMinutes());
    }
    setDateTime(newDate);
    onDateChange(newDate);
  };

  const handleTimeSelect = (timeString: string) => {
    const timeParts = timeString.split(':').map(part => parseInt(part, 10));
    const newDateTime = dateTime ? new Date(dateTime) : new Date();
  
    if (timeParts.length === 2) {
      newDateTime.setHours(timeParts[0], timeParts[1]);
      setDateTime(newDateTime);
      onDateChange(newDateTime)
    } else {
      console.error('Invalid time format:', timeString); // Error handling for invalid format
    }
  };


  const handleClear = () => {
    setDateTime(undefined);
    onDateChange(undefined);

  };

  const formattedTime = dateTime ? format(dateTime, "HH:mm") : "";


  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[150px] justify-start text-left font-normal",
              !dateTime && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateTime ? format(dateTime, "PPP") : <span>Due date</span>}
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
          <Button className="w-1/4 items-center" variant={"secondary"} onClick={handleClear}>Clear</Button>
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
