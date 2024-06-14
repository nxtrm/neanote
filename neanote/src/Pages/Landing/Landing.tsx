import React from 'react'
import Title from '../../../components/Sidebar/Title'
import { Button } from '../../../components/@/ui/button'
import { Link } from 'react-router-dom'
import Login from '../Login/Login'

function Landing() {
return (
    <div className='flex'>
        <div className="w-1/2 flex justify-center items-center min-h-screen bg-gray-200">
            <h1 className="text-5xl font-extrabold ">
                Neanote
            </h1>
        </div>
        <div className=" flex w-1/2 justify-center min-h-screen bg-background ">
            <div className="flex flex-col justify-center items-center">
                <h1 className='text-xl pt-2 font-bold'>Getting started</h1>
                <div className="flex flex-row gap-4 p-4">
                    <Link to="/login">
                        <Button variant={'outline'}>Login</Button>
                    </Link>
                    <Link to="/register">
                        <Button>Register</Button>
                    </Link>
                </div>
            </div>
        </div>
    </div>
)
}

export default Landing