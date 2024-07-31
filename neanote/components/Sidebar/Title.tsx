import React from 'react'
import { Link } from 'react-router-dom'

function Title({font}) {
  return (
    <Link to="/">
        <h1 style={{fontSize:font}} className="font-extrabold ">
            Neanote
        </h1>
    </Link>
  )
}

export default Title