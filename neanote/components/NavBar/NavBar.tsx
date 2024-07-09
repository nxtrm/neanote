import React from 'react';
import ThemeSwitcher from './ThemeSwitcher/ThemeSwitcher';
import LoginButton from './LoginButton/LoginButton';

function NavBar() {
  return (
    <div className='p-2 rounded-xl flex flex-row justify-between items-center border-[2px]'>
      <ThemeSwitcher/>
      <LoginButton/>
    </div>
  )
}

export default NavBar