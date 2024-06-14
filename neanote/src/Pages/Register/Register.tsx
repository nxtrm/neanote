import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from "react-hook-form";
import { z } from 'zod';
import { Button } from "../../../components/@/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from '../../../components/@/ui/form';
import { Input } from "../../../components/@/ui/input";
import { Label } from "../../../components/@/ui/label";
import { registerFormSchema } from '../../formValidation';
import { Link } from 'react-router-dom';
import { useRegister } from './useRegister';


function Register() {
  const {formHandler, register} = useRegister()
  // Defines the form
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      password: "",
      email: ""
    },
  })
  //Defines the form submit
  function onSubmit(values: z.infer<typeof registerFormSchema>) {
    console.log(values)
    formHandler(values)
    register()
  }

return (
  <div className=' p-3 '>
          <div className='items-center flex-col flex min-h-screen min-w-full bg-background max-h-screen rounded-xl border-[2px]'>
            <Link to="/get-started">
              <h1 className="text-4xl pb-40 pt-5 font-extrabold ">
                      Neanote
              </h1>
            </Link>
            
            <h1 className='text-2xl pt-4 pb-3 font-bold'>Register</h1>
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
                    name="email"
                    render={({ field }) => (
                  <FormItem>
                      <Label>Email</Label>
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
                <Link to="/login">
                        <p className='text-sm text-foreground'>New to Neanote? Log in</p>
                </Link>
                <Button type="submit">Submit</Button>
            </form>
            </Form>
          </div>
        </div>  
  )
}


export default Register