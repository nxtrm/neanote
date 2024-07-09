import React from 'react'
import { ToastContainer } from 'react-toastify'

function PageContainer({children}) {
  return (
    <div className='sm:p-0 md:p-2 lg:p-2 w-full h-full rounded-xl sm:border-[0px] md:border-[2px] lg:border-[2px]'>
      {children}
    </div>
  )
}

export default PageContainer