import React, { useEffect } from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import TitleComponent from '../../../components/TitleComponent/TitleComponent'
import { FaHistory } from "react-icons/fa";
import { useDashboard } from './useDashboard';
import { Label } from '../../../components/@/ui/label';
import UniversalCard from '../../../components/Universal/UniversalCard';
import { useNavigate } from "react-router-dom";
import { MdSpaceDashboard } from "react-icons/md";
import WidgetGrid from './Components/WidgetGrid';
import KanbanBoard from '../../../components/KanBan/KanbanBoard';

function Dashboard() {
  const {recents, getRecents, loading} = useDashboard()
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
      <TitleComponent>
          <MdSpaceDashboard size={'20px'} /> Dashboard
        </TitleComponent>
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