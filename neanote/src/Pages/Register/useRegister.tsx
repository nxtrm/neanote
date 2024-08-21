import Cookies from 'js-cookie';
import { create } from 'zustand';
import users from '../../api/users';

type RegisterState = {
  form: {
    username: string;
    password: string;
    email:string
  };
  formHandler: (form) => void;
  register: () => Promise<boolean>;
};

export let useRegister = create<RegisterState>((set,get)=>({

  form:{username:'',password:'', email: ""},

  formHandler:(form)=>{
      set({form})
  },

  register:async ()=>{
      let {form}=get()
      let response = await users.register(form)
      if(response){
        return true
      } else {
        return false
      }

  }

  }))