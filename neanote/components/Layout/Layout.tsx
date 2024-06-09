import React, { ReactNode } from 'react'

function Layout({ children }: { children: ReactNode}) {
  return (
    <div className='flex flex-col items-center min-h-screen min-w-full bg-background max-h-screen'>
        <nav>
            nav
            <div className='"flex gap-4 items-center'>
                side
            </div>
        </nav>
        <main className='flex flex-w-full flex-grow'>
            {children}
        </main>
    </div>
  )
}

export default Layout