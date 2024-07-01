import React, { useEffect } from 'react';
import { FaRegTrashAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import { Button } from '../../../components/@/ui/button';
import { Input } from "../../../components/@/ui/input";
import { Separator } from "../../../components/@/ui/separator";
import { Textarea } from "../../../components/@/ui/textarea";
import PageContainer from '../../../components/PageContainer/PageContainer';
import TagsDropdownMenu from '../Tags/components/TagsDropdownMenu';
import { DatePicker } from './DatePicker/DatePicker';
import { useTasks } from './useTasks';
import TaskCard from '../../../components/TaskCard/TaskCard';


function Tasks() {
  
  
    let {
        taskTitle,
        dueTime,
        handleSubtaskChange,
        currentTaskId,
        currentNoteId,
        setDate,
        setTime,
        textField,
        subtasks,
        tags,
        tasks, fetchTasks,
        section,
        setSection,
        setTaskTitle,
        setTags,
        setTextField,
        setSubtasks,
        handleAddSubtask,
        handleRemoveSubtask,
        handleEditTask,
        sendUpdatesToServer,
        handleDeleteTask,
        handleSaveTask,

    } = useTasks();

    useEffect(() => {
        fetchTasks();
      }, [fetchTasks]);


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
                {tasks.map((task, index) => (
                <div key={index} className="py-2">
                    <TaskCard task={task} />
                </div>
                ))}
            </div>
    );
    let taskForm = (
    <div className='p-1'>
    {/* Navbar */}
      <div className='flex flex-row justify-between'>

                <p className='pl-1 text-2xl font-bold'>{section === 'create task'? "Create Task" : "Edit Task"}</p>
                {/* Date Picker */}
                <div className='flex flex-row gap-2'>
                    <DatePicker onDateChange={setDate}/>
                    {/* Time Picker */}
                    <Input 
                        type="time" 
                        value={dueTime} 
                        onChange={(e) => setTime(e.target.value)} 
                        className="w-19" 
                        />
                    <Button size="icon" onClick={() => setSection("all tasks")}>
                        <MdCancel size={15} />
                    </Button>
                </div>

                
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
                      <TagsDropdownMenu onTagsSelected={()=> console.log("selected")}/>
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
                      <div key={subtask.subtaskid} className='flex pt-3 gap-2 items-center'>
                            <Input 
                                type='text' 
                                value={subtask.description} 
                                onChange={(e) => handleSubtaskChange(subtask.subtaskid, e.target.value)} 
                                />
                            <Button onClick={() => handleRemoveSubtask(subtask.subtaskid)} variant="secondary" size="icon">
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
                    <div className='flex flex-row gap-2'>
                        <Button variant="outline" onClick={() =>
                            handleDeleteTask(currentTaskId, currentNoteId)
                          
                            }>
                            Delete
                        </Button>
                        <Button onClick={
                            section === "create task" ? handleSaveTask: handleEditTask
                        }
                        >
                            Save
                        </Button>
                    </div>
                </div>
        </div>
      </div>
    );

    return (
        <PageContainer>

            {section === 'all tasks' && allTasks}
            {(section === 'create task' || section === 'edit') && taskForm}
            
        </PageContainer>
    );
}

export default Tasks;
