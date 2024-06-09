import React, { ReactNode } from 'react'
import Sidebar from '../Sidebar/Sidebar'

function Layout({ children }: { children: ReactNode}) {
return (
    <div className='flex flex-col min-h-screen min-w-full bg-background max-h-screen'>
 
            <div className="flex flex-row">
                    <div className='p-[10px] flex gap-4 justify-center min-h-screen w-[200px]'>
                            <Sidebar/>
                    </div>

                <div className='flex flex-col flex-grow'>
                    <nav className='p-[10px] h-[50px]'>
                        nav
                    </nav>
                    <main className='p-[10px] flex flex-w-full flex-grow' >
                            {children}
                    </main>
                </div>
            </div>
    </div>
)
}

export default Layout