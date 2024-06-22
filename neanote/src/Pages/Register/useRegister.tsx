import { useUser } from '../../../components/providers/useUser';
import api from '../../api'
import { create } from 'zustand'
import Cookies from 'js-cookie'

type RegisterState = {
  form: {
    username: string;
    password: string;
    email:string
  };
  formHandler: (form) => void;
  register: () => Promise<void>;
};

export let useRegister = create<RegisterState>((set,get)=>({

  form:{username:'',password:'', email: ""},
  
  formHandler:(form)=>{
      set({form})
  },
    
  register:async ()=>{
      let {form}=get()
      let response = await api.register(form)
      if(response){
          console.log("Success")
          Cookies.set('userId', response.userId, { expires: 7 })
  
      } 
      
  }
      
  }))