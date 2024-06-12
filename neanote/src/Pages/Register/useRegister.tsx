import api from '../../api'
import { create } from 'zustand'

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
          // let updateDBResponse = await frontDB.getState().updateDB('*')
          // if(updateDBResponse) window.location.href='/workorders'
  
      } 
      
  }
      
  }))