import React from 'react';
import { Button } from '../@/ui/button';
import { PiApproximateEqualsBold } from "react-icons/pi";
import { MdFormatUnderlined } from "react-icons/md";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../@/ui/tooltip";

interface ToggleButtonsProps {
  activeMode: 'approximate' | 'exact' ;
  setActiveMode: (mode: 'approximate' | 'exact' ) => void;
}

function ToggleButtons({ activeMode, setActiveMode }: ToggleButtonsProps) {
  const handleToggle = (mode: 'approximate' | 'exact') => {
    setActiveMode(mode);
  };

  return (
    <div className='flex flex-row'>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              className='rounded-r-none' 
              onClick={() => handleToggle('approximate')} 
              variant={activeMode === 'approximate' ? 'default' : 'secondary'} 
              aria-label="Approximate"
            >
              <PiApproximateEqualsBold size={'20px'} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle approximate mode</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              className='rounded-l-none' 
              onClick={() => handleToggle('exact')} 
              variant={activeMode === 'exact' ? 'default' : 'secondary'} 
              aria-label='Exact'
            >
              <MdFormatUnderlined size={'20px'} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle exact mode</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default ToggleButtons;