import React from 'react'
import { Subtask } from '../../src/api/types/taskTypes'
import CheckBox from '../CheckBox/CheckBox'

function SubTaskCard({ subtask }: { subtask: Subtask }) {
  return (
    <div className={`gap-3 items-center flex flex-row rounded-xl`}>
        <CheckBox onClick={() => console.log('clicked')}/>
        {subtask.description}
    </div>
  )
}

export default SubTaskCard