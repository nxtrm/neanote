import api from '../../api'
import { create } from 'zustand'
import { useUser } from '../../../components/providers/useUser';



type LoginState = {
  form: {
    username: string;
    password: string;
  };
  formHandler: (form) => void;
  login: () => Promise<boolean>;
};

export let useLogin = create<LoginState>((set,get)=>({
  form:{username:'',password:''},
  
  formHandler:(form)=>{
      set({form})
  },
    
  login:async ()=> {
      let {form}=get()
      let response = await api.login(form)
      if(response){
        return true
      } 
      else {
        return false
      }
      
  }
      
  }))