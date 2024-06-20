import React, { useEffect } from 'react'
import { FaRegUser } from "react-icons/fa";
import { LuLogIn } from "react-icons/lu";
import { useUser } from '../../providers/useUser';
import {Link, useNavigate} from 'react-router-dom'
import { Button } from '../../@/ui/button';

function LoginButton() {

  const navigate = useNavigate()
  return (
      <Button className='rounded-xl border-[2px]' variant="secondary" onClick={() => navigate("/login")} size="icon">
        <FaRegUser />
      </Button>

  )
}

export default LoginButton