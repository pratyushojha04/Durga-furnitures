// Paste this in your browser console to debug the JWT token

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

console.log('=== JWT Token Debug ===');
console.log('Token exists:', !!token);
console.log('User data:', user);

if (token) {
  try {
    // Decode JWT (without verification - just for debugging)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    console.log('Token payload:', payload);
    console.log('Token email field:', payload.email);
    console.log('Token sub field:', payload.sub);
    console.log('Token exp:', new Date(payload.exp * 1000));
  } catch (e) {
    console.error('Error decoding token:', e);
  }
}

console.log('=== End Debug ===');
