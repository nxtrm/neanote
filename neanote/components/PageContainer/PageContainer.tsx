import React from 'react'
import { ToastContainer } from 'react-toastify'

function PageContainer({children}) {
  return (
    <div className='p-2 w-full rounded-xl border-[2px]'>
        {children}
    </div>
  )
}

export default PageContainer