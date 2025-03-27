import React, { useEffect } from 'react';
import { FaHistory } from "react-icons/fa";
import { MdEdit, MdOutlineCheck, MdSpaceDashboard } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Button } from '../../../components/@/ui/button';
import { Label } from '../../../components/@/ui/label';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import UniversalCard from '../../../components/Universal/UniversalCard';
import EditPicker from './Components/EditPicker';
import WidgetGrid from './Components/WidgetGrid';
import { useDashboard } from './useDashboard';

function Dashboard() {
  const {recents, getRecents, loading, editMode, setEditMode, fetchWidgets} = useDashboard()
  const navigate = useNavigate();

    useEffect(() => {
      getRecents();

  },[getRecents]) 

  function handleEditClick(noteId, type) {
    localStorage.setItem(`current${type.charAt(0).toUpperCase() + type.slice(1)}Id`, noteId.toString());
    navigate(`/${type + 's'}/edit`);
}
  
  return (
    <>  
    <div className="flex flex-row justify-between pb-2">

        <TitleComponent>
          <MdSpaceDashboard size={'20px'} /> Dashboard
        </TitleComponent>
        <div className="flex flex-row gap-2">
          <Button onClick={() => setEditMode(!editMode)}>
            {editMode ? <MdOutlineCheck /> : <MdEdit />}
          </Button>
        <EditPicker/>
        </div>
    </div>
        {/* <KanbanBoard/> */}
        <WidgetGrid/>
      <div className='bg-secondary rounded-xl p-2'>
        <div className="flex flex-row gap-3 items-center pb-2">
            <TitleComponent><FaHistory size={'17px'}/> Recents</TitleComponent>
        </div> 
        <div className='flex flex-col flex-grow p-1 gap-2'>
            {loading && <p>Loading...</p>}
            {recents.length>0 &&
            <>
                <div className='flex-col flex gap-2'>
                    {recents.map((item, index) => (
                        <UniversalCard key={index} note={item} handleEditClick={()=>handleEditClick(item.noteid, item.type)} />
                    ))}
                </div>
            </>
            }
            {recents.length == 0 && !loading && <Label>No recent notes found.</Label>}
        </div>
      </div>
    </>
  )
}

export default Dashboard