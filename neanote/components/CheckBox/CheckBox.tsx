import React from 'react'
import {Button} from "../@/ui/button"
import { MdCheckBox, MdCheckBoxOutlineBlank} from "react-icons/md";

interface Props {
    onClick: () => void
}

function CheckBox({onClick}: Props) {
  const [checked, setChecked] = React.useState(false)
  return (
    <Button variant={"secondary"} size={"icon"} onClick={() => setChecked(!checked)}>
        {checked ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
    </Button>
  )
}

export default CheckBox