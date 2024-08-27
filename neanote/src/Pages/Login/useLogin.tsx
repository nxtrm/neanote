import Cookies from 'js-cookie';
import { create } from 'zustand';
import users from '../../api/users';
import { useTheme } from '../../../components/providers/theme-provider';


type LoginState = {
  form: {
    username: string;
    password: string;
  };
  formHandler: (form) => void;
  login: () => Promise<'light'|'dark'|'system' | false>;
};

export let useLogin = create<LoginState>((set,get)=>({
  form:{username:'',password:''},

  formHandler:(form)=>{
      set({form})
  },

  login:async ()=> {
      let {form}=get()
      let response = await users.login(form)
      if(response&&response.preferences){
        return (response.preferences.theme?response.preferences.theme:'system')
      }
      else {
        return false
      }

  }

  }))