import React, { useEffect } from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import { useTags } from './useTags'
import { Button } from '../../../components/@/ui/button';
import { Separator } from "../../../components/@/ui/separator";
import { FaPlus } from 'react-icons/fa6';
import TagCard from '../../../components/TagCard/TagCard';
import { z } from "zod"
import { MdCancel } from 'react-icons/md';

function Tags() {
  const {
    tags,
    fetchTags,
    section,
    setSection,
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