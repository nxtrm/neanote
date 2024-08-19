import React from 'react'
import { useUser} from './useUser'
import TitleComponent from '../../../components/TitleComponent/TitleComponent'
import { FaUser } from "react-icons/fa";
function Account() {
  const {user} = useUser()
  return (
    <>
        <div className="flex flex-row gap-3 items-center pb-2">
            <TitleComponent><FaUser size={'20px'}/> Archive</TitleComponent>
        </div>
    </>

  )
}

export default Account