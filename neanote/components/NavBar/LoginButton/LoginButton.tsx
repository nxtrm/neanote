import Cookies from 'js-cookie';
import React from 'react';
import { FaRegUser, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { Button } from '../../@/ui/button';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger
} from "../../@/ui/menubar";

function LoginButton() {
  
  const navigate = useNavigate()
  const handleSignOut = () => {
    Cookies.remove('token')
    Cookies.remove('userId')
    navigate('/get-started')
  }
  return (
    <Menubar className='border-0 p-0'>
    <MenubarMenu >
      <MenubarTrigger asChild>
        <Button className='rounded-xl border-[2px]' variant="secondary"  size="icon">
          <FaRegUser />
        </Button>
      </MenubarTrigger>
      <MenubarContent>
        <MenubarItem className='gap-2' onClick={
          Cookies.get('token') ? () => navigate("/account") :
          () => navigate("/login")
          }>
         <FaUser/> Account
        </MenubarItem>
        <MenubarSeparator />
          <MenubarItem onClick={handleSignOut} className='gap-2'>
           <FaSignOutAlt/> Sign out
          </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>

  )
}

export default LoginButton