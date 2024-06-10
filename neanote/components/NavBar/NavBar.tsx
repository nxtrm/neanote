import React from 'react'
import {
    Card,
    CardContent,
    CardHeader
} from "../@/ui/card"
import ThemeSwitcher from './ThemeSwitcher/ThemeSwitcher'

function NavBar() {
  return (
    <div className='p-2 flex rounded-xl border-[2px]'>
      <ThemeSwitcher/>
    </div>
  )
}

export default NavBar