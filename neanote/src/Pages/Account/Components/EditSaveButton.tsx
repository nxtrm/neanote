import React from 'react'
import { FaEdit, FaSave } from "react-icons/fa";
import { Button } from '../../../../components/@/ui/button';

interface Props {
    onClick: () => void;
  }
  
  function EditSaveButton({ onClick }: Props) {
    const [isEditing, setIsEditing] = React.useState(false);
  
    const handleClick = () => {
      setIsEditing(!isEditing);
      onClick();
    };
  
    return (
      <Button variant='secondary' size='icon' onClick={handleClick}>
        {isEditing ? <FaSave /> : <FaEdit />}
      </Button>
    );
  }
  
  export default EditSaveButton;