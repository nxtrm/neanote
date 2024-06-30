import React, { useEffect, useState } from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import { useTags } from './useTags'
import { Button } from '../../../components/@/ui/button';
import { Separator } from "../../../components/@/ui/separator";
import { FaPlus } from 'react-icons/fa6';
import TagCard from '../../../components/TagCard/TagCard';
import { HexColorPicker } from "react-colorful";
import { MdCancel } from 'react-icons/md';
import { Input } from '../../../components/@/ui/input';
import { Popover } from '@radix-ui/react-popover';
import { PopoverContent, PopoverTrigger } from '../../../components/@/ui/popover';

function Tags() {
  const {
    tags,
    fetchTags,
    section,
    setSection,
    tagTitle,
    setTagTitle,
    color,
    setColor,
    handleSaveTag,
    handleEditTag,
    handleDeleteTag
  } = useTags()

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);


  let allTags = (
    <div className='p-1'>
        <div className='flex flex-row justify-between'>
            <p className='pl-1 text-2xl font-bold'>Tags</p>
            <Button size="icon" onClick={() => setSection("create")}>
                <FaPlus />
            </Button>
        </div>
        <div className='pt-2'>
            <Separator />
        </div>
            {tags.map((tag, index) => (
            <div key={index} className="py-2">
                <TagCard tag={tag} />
            </div>
            ))}
        </div>
);
const createTagForm = (
  <div className="p-1">
    {/* Navbar */}
    <div className='flex flex-row justify-between'>

      <p className='pl-1 text-2xl font-bold'>{section === 'create'? "Create Tag" : "Edit Tag"}</p>
      {/* Date Picker */}
      <div className='flex flex-row gap-2'>
          <Button size="icon" onClick={() => setSection("all tags")}>
              <MdCancel size={15} />
          </Button>
      </div>


    </div>
    <div className='pt-2'>
        <Separator />
    </div>
    <div className='py-2 flex flex-col gap-2'>

      <Input 
          className='border rounded-md w-full h-10 leading-tight focus:outline-none focus:shadow-outline' 
          placeholder='Title'
          type='text' 
          value={tagTitle} 
          onChange={(e) => setTagTitle(e.target.value)} 
          />
        <Popover>
          <PopoverTrigger asChild>
              <Button style={{backgroundColor:color }}/>
          </PopoverTrigger>
          <PopoverContent className='w-200'>
              <HexColorPicker color={color} onChange={setColor} />
          </PopoverContent>
        </Popover>
    </div>
    <div className='flex flex-row gap-3'>

      <Button onClick=
      {
        section === "create" ? handleSaveTag: handleEditTag
      }>
        Save
      </Button>
      {section === "edit" && <Button variant={'secondary'} onClick={handleDeleteTag}>Delete</Button>}
        </div>
    
  </div>
);

// ...

return (
  <PageContainer>
    {section === 'all tags' && allTags}
    {(section === 'create' || section === 'edit') && createTagForm}
  </PageContainer>
);
}

export default Tags