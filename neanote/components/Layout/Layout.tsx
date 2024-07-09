import React, { ReactNode } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import NavBar from '../NavBar/NavBar'
import { Outlet } from "react-router-dom";


const Layout = () => {
return (
    <div className='flex flex-col min-h-screen min-w-full bg-background max-h-screen'>
 
            <div className="flex  flex-row">
                <div className='pt-3 pl-3 pb-3 sm:block hidden' >
                    <Sidebar/>
                </div>

                <div className='flex flex-col flex-grow'>
                    <nav className='p-3 h-15'>
                        <NavBar/>
                    </nav>
                    <main className='p-3 pt-0 flex flex-w-full flex-grow' >
                            <Outlet/>
                    </main>
                </div>
            </div>
    </div>
)
}

export default Layout