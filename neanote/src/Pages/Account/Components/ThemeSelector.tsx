import React from "react"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "../../../../components/@/ui/select"
   
  export function ThemeSelector({ theme, onChange }) {
    return (
      <Select value={theme} onValueChange={onChange}>
        <SelectTrigger className="w-[30vw]">
          <SelectValue placeholder="Select your preferred theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Themes</SelectLabel>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }