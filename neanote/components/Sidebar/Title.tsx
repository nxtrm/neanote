import React from 'react'
import { Link } from 'react-router-dom'

function Title() {
  return (
    <Link to="/">
        <h1 className="text-[35px] font-extrabold ">
            Neanote
        </h1>
    </Link>
  )
}

export default Title