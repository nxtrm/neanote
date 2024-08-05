import React from 'react'

function TitleComponent({children}) {
  return (
    <p className="pl-2 text-2xl flex-row flex items-center gap-3 font-bold">{children}</p>
  )
}

export default TitleComponent