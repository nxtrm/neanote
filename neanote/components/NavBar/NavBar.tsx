import React, { useState } from 'react';
import ThemeSwitcher from './ThemeSwitcher/ThemeSwitcher';
import LoginButton from './LoginButton/LoginButton';
import Sidebar from '../Sidebar/Sidebar';
import Title from '../Sidebar/Title';
import SearchBar from '../SearchBar/SearchBar';

function NavBar() {

    return (

        <div className='p-2 rounded-xl flex flex-row justify-between items-center 
          border-[2px]
        '>
          <div className='flex flex-row pl-2 gap-5 items-center'>
            <Sidebar/>
            <Title font={"28px"}/>
          </div>
            <SearchBar/>
          <div className='flex flex-row gap-2'>
            <ThemeSwitcher/>
            <LoginButton/>
          </div>
        </div>
      )
  
}

export default NavBar