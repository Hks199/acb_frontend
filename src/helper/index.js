const TOKEN_KEY = "tk_x1f9s2kd0v";

export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};
