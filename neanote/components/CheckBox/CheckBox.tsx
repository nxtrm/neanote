import React from 'react'
import {Button} from "../@/ui/button"
import { MdCheckBox, MdCheckBoxOutlineBlank} from "react-icons/md";

interface Props {
    checked: boolean;
    onChange: () => void;
}

function CheckBox({ checked, onChange }: Props) {
    return (
        <Button variant={"secondary"} size={"icon"} onClick={onChange}>
            {checked ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
        </Button>
    );
}

export default CheckBox