import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from "react-hook-form";
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from "../../../components/@/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from '../../../components/@/ui/form';
import { Input } from "../../../components/@/ui/input";
import { Label } from "../../../components/@/ui/label";
import { loginFormSchema } from '../../formValidation';

import Cookies from 'js-cookie';
import { useLogin } from './useLogin';
import { useTheme } from '../../../components/providers/theme-provider';

function Login() {
  const {formHandler, login} = useLogin()
  const {setTheme} = useTheme()
  const navigate = useNavigate()
  // Defines the form
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: ""
    },
  })


  
  async function onSubmit(values: z.infer<typeof loginFormSchema>) {

      formHandler(values);
      console.log("Submitting form", values);
      login().then(loginResult => {
        if (loginResult) {
          setTheme(loginResult)
          navigate("/")
        }
      })

    }

return (
  <div className=' p-3 '>
          <div className='items-center flex-col flex min-h-screen min-w-full bg-background max-h-screen rounded-xl border-[2px]'>
            <Link to="/get-started">
              <h1 className="text-4xl pb-40 pt-5 font-extrabold ">
                      Neanote
              </h1>
            </Link>
            <h1 className='text-2xl pt-4 pb-3 font-bold'>Login</h1>
            <Form {...form}>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-[250px]">

                <div className='space-y-1'>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                      <Label>Username</Label>
                      <FormControl>
                      <Input
                        {...field}
                      />
                      </FormControl>
                      <FormMessage />
                    </FormItem>)}/>
                </div>
                <div className='space-y-1'>
                  <FormField
                    control={form.control}
                  name="password"
                render={({ field }) => (
                  <FormItem>
                      <Label>Password</Label>
                      <FormControl>
                      <Input
                        {...field}
                      />
                      </FormControl>
                      <FormMessage />
                    </FormItem>)}/>
                </div>
              {/* Add more form fields here... */}
              <Link to="/register">
                        <p className='text-sm pt-2 text-foreground'>Already have an account? Register</p>
              </Link>
              <Button type="submit" onClick={()=> console.log("Clicked")}>Submit</Button>
            </form>
            </Form>
          </div>
        </div>  
  )
}


export default Login