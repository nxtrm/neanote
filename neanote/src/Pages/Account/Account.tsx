import React, { useEffect, useState } from 'react'
import { useUser} from './useUser'
import TitleComponent from '../../../components/TitleComponent/TitleComponent'
import { FaSave, FaUser } from "react-icons/fa";
import { Label } from '../../../components/@/ui/label';
import { Input } from '../../../components/@/ui/input';
import { Button } from '../../../components/@/ui/button';
import {Separator} from '../../../components/@/ui/separator'
import {PasswordDrawerDialog }from './Components/PasswordDrawerDialog';

function Account() {
    const { currentUser, getUser, updateCurrentUser, pendingChanges, validationErrors, loading, handleUpdateDetails } = useUser();
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

        <div className='flex flex-col gap-3'>
          <div className='bg-secondary p-3 rounded-xl flex flex-col gap-2'>

            <h2 className='font-bold text-xl'>Details</h2>
              <Separator/>

              <Label htmlFor="username">Username: </Label>
              <Input id="username" className='50vw' value={currentUser?.username} onChange={(e) => updateCurrentUser('username', e.target.value)} />
              {validationErrors['username'] && (
                <Label htmlFor="username" className='text-destructive'>{validationErrors['username']}</Label>
              )}

              <Label htmlFor="email">Email:</Label>
              <Input id="email" value={currentUser?.email} onChange={(e) => updateCurrentUser('email', e.target.value)} />
              {validationErrors['email'] && (
                <Label htmlFor="email" className='text-destructive'>{validationErrors['email']}</Label>
              )}
              {/* <Label htmlFor="password">Password:</Label>
              <Input id="password" type="password" value={currentUser?.password} onChange={(e) => updateCurrentUser('password', e.target.value)} />  */}

            <Button className='gap-2 w-fit' disabled={!pendingChanges || !isValidationErrorsEmpty} onClick={handleUpdateDetails}>
              <FaSave /> {loading ? 'Saving...' : 'Save'}
              </Button>
          </div>
          <div className='bg-secondary p-3 rounded-xl flex flex-col gap-2'>
            <h2 className='font-bold text-xl'>Preferences</h2>
              <Separator/>
              #theme switch
          </div>
          <div className='border-[2px]  border-destructive p-3 rounded-xl flex flex-col gap-2'>
            <h2 className='font-bold text-xl'>Security</h2>
              <Separator/>
              <PasswordDrawerDialog/>

          </div>
        </div>
      </>
    );
  }

  export default Account;