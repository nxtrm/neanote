import React, { useState } from 'react';
import ThemeSwitcher from './ThemeSwitcher/ThemeSwitcher';
import LoginButton from './LoginButton/LoginButton';
import Sidebar from '../Sidebar/Sidebar';

function NavBar() {

    return (

        <div className='p-2 rounded-xl flex flex-row justify-between items-center border-[2px]'>
          <Sidebar/>
          <ThemeSwitcher/>
          <LoginButton/>
        </div>
      )
  
}

export default NavBar