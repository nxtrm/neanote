import React, { ReactNode } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import NavBar from '../NavBar/NavBar'
import { Outlet } from "react-router-dom";


const Layout = () => {
return (
    <div className='flex flex-col min-h-screen min-w-full bg-background max-h-screen'>
 
            <div className="flex flex-row">
                <div className='p-3 ' >
                    <Sidebar/>
                </div>

                <div className='flex flex-col flex-grow'>
                    <nav className='p-[15px] h-[50px]'>
                        <NavBar/>
                    </nav>
                    <main className='p-[15px] flex flex-w-full flex-grow' >
                            <Outlet/>
                    </main>
                </div>
            </div>
    </div>
)
}

export default Layout