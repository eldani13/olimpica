export const setAuthData = (username) => {
    localStorage.setItem('username', username);
  };
  
  export const removeAuthData = () => {
    localStorage.removeItem('username');
  };
  