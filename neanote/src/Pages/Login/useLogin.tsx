
import { create } from 'zustand'

export let useLogin = create((set,get)=>({

  form:{login:'',password:''},
  
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