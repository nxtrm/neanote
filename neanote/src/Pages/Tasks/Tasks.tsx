import React, { useState } from 'react';
import PageContainer from '../../../components/PageContainer/PageContainer';
import { useTasks } from './useTasks';
import { Button } from '../../../components/@/ui/button';
import { FaPlus } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import { Separator } from "../../../components/@/ui/separator";
import { Textarea } from "../../../components/@/ui/textarea";
import { Input } from "../../../components/@/ui/input";
import { TagsDropdownMenu } from '../Tags/components/TagsDropdownMenu';
import { FaRegTrashAlt } from "react-icons/fa";
import { useToast } from '../../../components/@/ui/use-toast';

function Tasks() {
  const {toast} = useToast();
    let {
        taskTitle,
        textField,
        subtasks,
        tags,
        section,
        setSection,
        setTaskTitle,
        setTags,
        setTextField,
        setSubtasks,
        handleAddSubtask,
        handleRemoveSubtask,
        handleSubtaskChange,
        handleTagAdd,
        handleSaveTask,

    } = useTasks();

    let allTasks = (
        <div className='p-1'>
            <div className='flex flex-row justify-between'>
                <p className='pl-1 text-2xl font-bold'>Tasks</p>
                <Button size="icon" onClick={() => setSection("create task")}>
                    <FaPlus />
                </Button>
            </div>
            <div className='pt-2'>
                <Separator />
            </div>
        </div>
    );

let createTask = (
  <div className='p-1'>
{/* Navbar */}
      <div className='flex flex-row justify-between'>
                <p className='pl-1 text-2xl font-bold'>Create Task</p>
                <Button size="icon" onClick={() => setSection("all tasks")}>
                    <MdCancel size={15} />
                </Button>
            </div>
            <div className='py-3'>
                <Separator />
            </div>


{/* Title and tags */}
      <div className='flex flex-row items-center gap-2'> 
                    <Input 
                        className='border rounded-md w-full h-10 leading-tight focus:outline-none focus:shadow-outline' 
                        placeholder='Title'
                        type='text' 
                        value={taskTitle} 
                        onChange={(e) => setTaskTitle(e.target.value)} 
                    />
                      <TagsDropdownMenu />
                      {/* <div className='flex flex-row items-center'>
                          {tags.map((tag, index) => (
                              <span key={index} className='bg-gray-200 rounded-full px-2 py-1 text-sm mr-2'>{tag}</span>
                          ))}
                      </div> */}
                </div>


{/* Input Field */}
    <div className='pt-3 rounded-md'>
                <Textarea value={textField}  placeholder="Describe your task here" onChange={(e) => setTextField(e.target.value)} />
                {subtasks.map((subtask, index) => (
                      <div key={subtask.id} className='flex pt-3 gap-2 items-center'>
                            <Input 
                                type='text' 
                                value={subtask.text} 
                                onChange={(e) => handleSubtaskChange(index, 'text', e.target.value)} 
                                />
                            <Button onClick={() => handleRemoveSubtask(subtask.id)} variant="secondary" size="icon">
                              <FaRegTrashAlt/>
                            </Button>
                            
                        </div>
                    ))}
{/* Footer */}
      <div className='flex py-3 justify-between'>
                    <Button onClick={handleAddSubtask}>
                      <div className='flex flex-row items-center gap-2'>
                        <FaPlus /> 
                        Add Subtask
                      </div>
                    </Button>
                    <Button onClick={handleSaveTask
                    }
                      >
                        Save
                    </Button>
                </div>
        </div>
      </div>
    );

    return (
        <PageContainer>
            {section === 'all tasks' && allTasks}
            {section === 'create task' && createTask}
        </PageContainer>
    );
}

export default Tasks;
