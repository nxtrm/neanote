import React from 'react'
import PageContainer from '../../../components/PageContainer/PageContainer'
import TitleComponent from '../../../components/TitleComponent/TitleComponent'
import { FaHistory } from "react-icons/fa";
function Dashboard() {
  return (
    <>
      Dashboard
      <div className='bg-secondary rounded-xl p-2'>
        <div className="flex flex-row gap-3 items-center pb-2">
            <TitleComponent><FaHistory size={'17px'}/> Recents</TitleComponent>
        </div> 
        <div className='flex flex-col flex-grow gap-2'>
        </div>
      </div>
    </>
  )
}

export default Dashboard