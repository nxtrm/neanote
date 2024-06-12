import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from "react-hook-form";
import { z } from 'zod';
import { Button } from "../../../components/@/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from '../../../components/@/ui/form';
import { Input } from "../../../components/@/ui/input";
import { Label } from "../../../components/@/ui/label";
import { loginFormSchema } from '../../formValidation';
import { useLogin } from './useLogin';
import { Link } from 'react-router-dom';


function Login() {
  const {formHandler, login} = useLogin()
  // Defines the form
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: ""
    },
  })
  //Defines the form submit
  function onSubmit(values: z.infer<typeof loginFormSchema>) {
    formHandler(values)
    login()
  }

return (
  <div className=' p-3 '>
          <div className='justify-center items-center flex-col flex min-h-screen min-w-full bg-background max-h-screen rounded-xl border-[2px]'>
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
                        <p className='text-sm text-foreground'>Already have an account? Register</p>
              </Link>
              <Button type="submit">Submit</Button>
            </form>
            </Form>
          </div>
        </div>  
  )
}


export default Login