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
        dueDate,
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

    function resetTask() {
        useTasks.setState({
          currentTaskId: undefined,
          currentNoteId: undefined,
          taskTitle: '',
          dueDate: undefined,
          dueTime: '',
          tags: [],
          selectedTagIds: [],
          textField: '',
          subtasks: [],
          section: 'all tasks',
          pendingUpdates: {},
        });
      }

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

    return (
        <PageContainer>
            {allTasks}
        </PageContainer>
    );
}

export default Tasks;
