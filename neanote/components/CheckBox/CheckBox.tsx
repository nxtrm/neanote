import React from 'react'
import {Button} from "../@/ui/button"
import { MdCheckBox, MdCheckBoxOutlineBlank} from "react-icons/md";

interface Props {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}

function CheckBox({ checked, onChange, disabled }: Props) {
    return (
        <Button disabled={disabled} variant={"secondary"} size={"icon"} onClick={onChange}>
            {checked ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
        </Button>
    );
}

export default CheckBox