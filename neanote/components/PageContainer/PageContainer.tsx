import React from 'react'

function PageContainer({ children }) {
  return (
    <div className='
      w-full flex flex-col flex-grow rounded-xl 
      sm:p-0 md:p-2 lg:p-2 
      sm:border-[0px] md:border-[2px] lg:border-[2px]
    '>
      {children}
    </div>
  );
}

export default PageContainer