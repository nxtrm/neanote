import React, { ReactNode } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import NavBar from '../NavBar/NavBar'
import { Outlet } from "react-router-dom";
import PageContainer from '../PageContainer/PageContainer';


const Layout = () => {
  return (
    <div className='flex flex-col min-h-screen min-w-full bg-background'>
        <nav className='p-2'>
          <NavBar/>
        </nav>
        <main className='flex-grow p-2 pt-0 flex flex-col'>
          <PageContainer>
            <Outlet/>
          </PageContainer>
        </main>
        {/* <footer className='p-2 pt-0 h-15'>
         
        </footer> */}
    </div>
  )
}

export default Layout;