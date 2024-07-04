import { jwtDecode } from 'jwt-decode';

const token = 'your-jwt-token-here';
const decoded = jwtDecode(token);
console.log(decoded);
