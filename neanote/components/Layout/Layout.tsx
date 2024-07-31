import React, { ReactNode } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import NavBar from '../NavBar/NavBar'
import { Outlet } from "react-router-dom";


const Layout = () => {
    return (
      <div className='flex flex-col min-h-screen min-w-full bg-background'>
        <div className="flex flex-row">
          <div className='flex flex-col flex-grow'>
            <nav className='p-2'>
              <NavBar/>
            </nav>
            <main className='p-2 pt-0 flex-grow'>
              <Outlet/>
            </main>
          </div>
        </div>
      </div>
    )
}

export default Layout