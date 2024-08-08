import React from 'react'

function PageContainer({ children }) {
  return (
    <div className='
      w-full flex flex-col flex-grow rounded-xl 
      sm:p-0 md:p-3 lg:p-3 
      sm:border-[0px] md:border-[2px] lg:border-[2px]
    '>
      {children}
    </div>
  );
}

export default PageContainer