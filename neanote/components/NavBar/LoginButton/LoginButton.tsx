import React, { useEffect } from 'react'
import { FaRegUser } from "react-icons/fa";
import { LuLogIn } from "react-icons/lu";
import { useUser } from '../../providers/useUser';
import {Link} from 'react-router-dom'

function LoginButton() {
    const { isLoggedIn } = useUser((state) => ({ isLoggedIn: state.isLoggedIn }));
    
    useEffect(() => {
      console.log("isLoggedIn changed:", isLoggedIn);
  }, [isLoggedIn]);
  return (
    <div className='bg-secondary rounded-xl border-[2px] w-10 h-10 flex items-center justify-center'>
      {isLoggedIn ? 
      <Link to="/account">
          <FaRegUser />
      </Link> : 
      <Link to="/login">
        <LuLogIn size={20} strokeWidth={2.1}/>
      </Link> }
        
    </div>

  )
}

export default LoginButton