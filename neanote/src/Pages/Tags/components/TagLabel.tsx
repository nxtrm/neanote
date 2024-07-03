import React from 'react'
import { IoIosCheckbox,} from "react-icons/io";
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { Button } from '../../../../components/@/ui/button';
import { useTasks } from '../../Tasks/useTasks';

interface Props {
    key: number;
    tagId: number; 
    color: string;
    title: string;

  }
  
  function TagLabel({ color, title, tagId}: Props) {
    const { selectedTagIds, setSelectedTagIds } = useTasks();
    let checked = selectedTagIds.includes(tagId);
    const handleClick = () => {
        setSelectedTagIds(checked ? selectedTagIds.filter((id) => id !== tagId) : [...selectedTagIds, tagId]
      );
      console.log(selectedTagIds)
      };

    return (
      <Button
        variant={"ghost"}
        className="justify-left flex gap-2 border-2 rounded-md p-2 flex-row items-center"
        onClick={handleClick} 
      >
        {checked ? <IoIosCheckbox /> : <MdOutlineCheckBoxOutlineBlank />}
        <div style={{ backgroundColor: color, width: "15px", height: "15px", borderRadius: "50%" }}></div>
        {title}
      </Button>
    );
  }

export default TagLabel