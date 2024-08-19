import Cookies from 'js-cookie';
import React from 'react';
import { FaRegUser } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { Button } from '../../@/ui/button';

function LoginButton() {

  const navigate = useNavigate()
  return (
      <Button className='rounded-xl border-[2px]' variant="secondary" onClick={
        Cookies.get('token') ? () => navigate("/account") :
        () => navigate("/login")
        } size="icon">
        <FaRegUser />
      </Button>

  )
}

export default LoginButton