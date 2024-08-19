import React, { useEffect, useState } from 'react'
import { useUser} from './useUser'
import TitleComponent from '../../../components/TitleComponent/TitleComponent'
import { FaSave, FaUser } from "react-icons/fa";
import { Label } from '../../../components/@/ui/label';
import { Input } from '../../../components/@/ui/input';
import { Button } from '../../../components/@/ui/button';
function Account() {
    const { currentUser, getUser, updateCurrentUser, pendingChanges, validationErrors, loading, handleSave } = useUser();
    const [isValidationErrorsEmpty, setIsValidationErrorsEmpty] = useState(true);
  
    useEffect(() => {
      setIsValidationErrorsEmpty(
        Object.keys(validationErrors).every(key => !validationErrors[key])
      );
      console.log(validationErrors);
    }, [validationErrors]);
  
    useEffect(() => {
      getUser();
    }, [getUser]);
  
    return (
      <>
        <div className="flex flex-row gap-3 items-center pb-2">
          <TitleComponent><FaUser size={'20px'} /> Account</TitleComponent>
        </div>
  
        <div className='flex flex-col gap-3 m-2'>
          <div className='grid grid-cols-2 justify-start gap-2'>
            <Label htmlFor="username">Username: </Label>
            <Input id="username" value={currentUser?.username} onChange={(e) => updateCurrentUser('username', e.target.value)} />
  
            <Label htmlFor="email">Email:</Label>
            <Input id="email" value={currentUser?.email} onChange={(e) => updateCurrentUser('email', e.target.value)} />
  
            {/* <Label htmlFor="password">Password:</Label>
            <Input id="password" type="password" value={currentUser?.password} onChange={(e) => updateCurrentUser('password', e.target.value)} />  */}
          </div>
          <Button className='gap-2 w-fit' disabled={!pendingChanges || !isValidationErrorsEmpty} onClick={handleSave}>
            <FaSave /> {loading ? 'Saving...' : 'Save'}
            </Button>
        </div>
      </>
    );
  }
  
  export default Account;