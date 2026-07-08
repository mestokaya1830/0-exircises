import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  // 5 saniye içinde sunucudan cevap gelmezse isteği iptal et!
  timeout: 5000 
});

export default api;
