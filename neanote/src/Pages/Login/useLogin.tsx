import Cookies from 'js-cookie';
import { create } from 'zustand';
import users from '../../api/users';


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
      let response = await users.login(form)
      if(response){
        Cookies.set('userId', response.userId, { expires: 7 })
        return true
      }
      else {
        return false
      }

  }

  }))