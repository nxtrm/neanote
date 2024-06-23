import axios from 'axios';
import Cookies from 'js-cookie';
import { showToast } from '../components/Toast';

let a = axios.create({
	baseURL: "http://localhost:5000",
	withCredentials: true,
	headers: {
        'Authorization': `Bearer ${Cookies.get('token')}`
    }
});

a.interceptors.request.use((request) => {
	//if there is no internet connection
	if (!navigator.onLine) {
		throw new Error('No internet connection');
	}

	//if user doesnt have a token
	if ((request.url !== '/api/login' && request.url !== '/api/register') && !Cookies.get('token')) {
		window.location.href = '/get-started';
		throw new Error('No token');
	}

	 //Add the JWT token to the headers
	 request.headers['Authorization'] = `Bearer ${Cookies.get('token')}`;

	return request;
});

let api = {
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

	tasks : {
		create: async (userId, taskTitle, tags, textField, subtasks,dueDate, dueTime) => {
			try {
				let response = await a.post(`/api/tasks/${userId}`, {
					userId,
					taskTitle,
					tags,
					textField,
					subtasks,
					dueDate,
					dueTime
				});

				if (response.status === 200) {
					showToast('s', 'Task has been created successfully');
				} else {
					showToast('e', 'There was an error creating the task')
				}

				return response.data;
			} catch (error) {
				showToast('e', error);
				return false;
			}
		},
		getAll : async (userId) => {
			try {
				let response = await a.get(`/api/tasks/${userId}`);

				return response.data;
			} catch (error) {
				showToast('e', error);
				return false;
			}
		}
		
	}
}

export default api