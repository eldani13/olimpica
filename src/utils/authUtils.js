export const setAuthData = (username) => {
    localStorage.setItem('username', username);
    localStorage.setItem('token', username);
  };
  
  export const removeAuthData = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
  };
  