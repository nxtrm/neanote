import { showToast } from "../../components/Toast";
import a from "./api";
import { UserGetResponse } from "./types/userTypes";


const users = {

    login: async (body) => {
        try {
            let response = await a.post(`/api/login`, body);

            if (response.status === 200) {
                showToast('s', 'Login successful');
            } else {
                showToast('e', `There was an error logging in: ${response.data.message}`)
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
    getUser: async () => {
        try {
            let response = await a.get<UserGetResponse>(`/api/user`);

            if (response.status === 200) {
                return response.data.data;
            }
            else {
                showToast('e', `There was an error getting the user: ${response.data.message}`)
                return false;
            }
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },

    updateUserDetails: async (body) => {
        try {
            let response = await a.put(`/api/user`, body);

            if (response.status === 200) {
                showToast('s', 'User data has been updated successfully');
            } else {
                showToast('e', `There was an error updating the user: ${response.data.message}`)
            }

            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },
    changePassword: async (password, newpassword) => {
        try {
            let response = await a.put(`/api/user`,{ password, newpassword });

            if (response.status === 200) {
                showToast('s', 'Password has been updated successfully');
            } else {
                showToast('e', `There was an error updating the password: ${response.data.message}`)
            }

            return response.data;
        } catch (error) {
            showToast('e', error);
            return false;
        }
    },
}


export default users