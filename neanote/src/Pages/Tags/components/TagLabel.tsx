import React from 'react';
import { IoIosCheckbox, } from "react-icons/io";
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { Button } from '../../../../components/@/ui/button';
import { useTags } from '../useTags';
import { UUID } from 'crypto';

interface Props {
  tagId: UUID;
  color: string;
  title: string;
  onChange: () => void;
}

function TagLabel({ color, title, tagId, onChange }: Props) {
  const { selectedTagIds, setSelectedTagIds } = useTags();
  const checked = selectedTagIds.includes(tagId);


  const handleClick = () => {
    const newSelectedTagIds = checked
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    setSelectedTagIds(newSelectedTagIds);
    onChange()
  }

  return (
    <Button
      variant="ghost"
      className="justify-left  flex gap-2 border-2 rounded-md p-2 flex-row items-center"
      onClick={handleClick}
    >
      {checked ? <IoIosCheckbox /> : <MdOutlineCheckBoxOutlineBlank />}
      <div style={{ backgroundColor: color, width: "15px", height: "15px", borderRadius: "50%" }}/>
      <div className='max-w-[100px] overflow-hidden overflow-ellipsis'>
        {title}
      </div>
    </Button>
  );
}

export default TagLabel;
