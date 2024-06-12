import axios from 'axios';
let a = axios.create({
	baseURL: "http://localhost:5173",
	withCredentials: true,
});

let api = {
    login: async (body) => {
		try {
			let response = await a.post(`/api/login`, body);

			return response.data;
		} catch (error) {
			console.log(error);
			return false;
		}
	},
}

export default api