import React from 'react'
import {Button} from "../@/ui/button"
import { MdCheckBox, MdCheckBoxOutlineBlank} from "react-icons/md";
import { FaCheck } from "react-icons/fa";

interface Props {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}

function CheckBox({ checked, onChange, disabled }: Props) {
    return (
        <Button disabled={disabled} className='rounded-full border-2 border-primary' variant={checked?"default":"secondary"} size={"icon"} onClick={onChange}>
            <FaCheck />
        </Button>
    );
}

export default CheckBox