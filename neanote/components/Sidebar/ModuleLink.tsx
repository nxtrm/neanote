import React from 'react'
import {Button} from '../@/ui/button'
import { Link, useNavigate } from 'react-router-dom'


interface Props {
  link: string,
  text: string,
  disabled: boolean
}

function ModuleLink({link,text, disabled}:Props) {

  const navigate = useNavigate()
  return (
    <Button className='margin-0 p-0 justify-start' onClick={() => navigate(`/${link}`)} variant="link" disabled={disabled}>
      {text}
    </Button>
  )
}

export default ModuleLink