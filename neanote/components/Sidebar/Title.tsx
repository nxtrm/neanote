import React from 'react'
import { Link } from 'react-router-dom'

function Title() {
  return (
    <Link to="/">
        <h1 className="text-3xl pt-2 font-extrabold ">
            Neanote
        </h1>
    </Link>
  )
}

export default Title