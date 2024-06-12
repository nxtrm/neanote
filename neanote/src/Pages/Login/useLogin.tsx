import api from '../../api'
import { create } from 'zustand'

type LoginState = {
  form: {
    username: string;
    password: string;
  };
  formHandler: (form) => void;
  login: () => Promise<void>;
};

export let useLogin = create<LoginState>((set,get)=>({

  form:{username:'',password:''},
  
  formHandler:(form)=>{
      set({form})
  },
    
  login:async ()=>{
      let {form}=get()
      let response = await api.login(form)
      if(response){
          
          // let updateDBResponse = await frontDB.getState().updateDB('*')
          // if(updateDBResponse) window.location.href='/workorders'
  
      } 
      
  }
      
  }))