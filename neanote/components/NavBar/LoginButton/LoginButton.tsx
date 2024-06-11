import React from 'react'
import { FaRegUser } from "react-icons/fa";
import { LuLogIn } from "react-icons/lu";
import { useUser } from '../../providers/useUser';
import {Link} from 'react-router-dom'

function LoginButton() {
    const { user } = useUser();
  return (
    <div className='bg-secondary rounded-xl border-[2px] w-10 h-10 flex items-center justify-center'>
        <Link to="/login">
        {user.isLoggedIn ? <FaRegUser /> : <LuLogIn size={20} stroke-width={2.1}/>}
        </Link>
    </div>

  )
}

export default LoginButton