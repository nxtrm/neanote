import React, { useEffect } from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import TitleComponent from '../../../components/TitleComponent/TitleComponent'
import { FaHistory } from "react-icons/fa";
import { useDashboard } from './useDashboard';
import { Label } from '../../../components/@/ui/label';
function Dashboard() {
  const {recents, getRecents, loading} = useDashboard()

    useEffect(() => {
      getRecents();
  },[getRecents]) 
  
  return (
    <>
      Dashboard
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
                        <div key={index} className='flex flex-row gap-2 items-center'>
                            <p>{item.title}</p>
                            <p>{item.type}</p>
                        </div>
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