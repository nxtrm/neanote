import axios from 'axios';
import Cookies from 'js-cookie';

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


export default a