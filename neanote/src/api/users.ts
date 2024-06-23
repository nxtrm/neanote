import { showToast } from "../../components/Toast";
import a from "./api";


const users = {

    login: async (body) => {
        try {
            let response = await a.post(`/api/login`, body);
            
            if (response.status === 200) {
                showToast('s', 'Login successful');
            } else {
                showToast('e', 'There was an error logging in')
            }
            
            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },
    register: async (body) => {
        try {
            let response = await a.post(`/api/register`, body);
            
            if (response.status === 200) {
                showToast('s', 'User has been registered created successfully');
            } else {
                showToast('e', 'There was an error registering the user')
            }
            
            return response.data;
    } catch (error) {
        showToast('e', error);
        return false;
    }
},
}

export default users