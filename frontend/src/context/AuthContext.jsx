import { createContext, useContext, useEffect, useReducer } from 'react';

const AuthContext = createContext();

const initialState = {
  usuario: null,
  token: localStorage.getItem('token') || null,
  rol: localStorage.getItem('rol') || null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('rol', action.payload.rol);
      return {
        ...state,
        usuario: action.payload.usuario,
        token: action.payload.token,
        rol: action.payload.rol,
      };
    case 'LOGOUT':
      localStorage.clear();
      return {
        usuario: null,
        token: null,
        rol: null,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Aquí puedes cargar info de usuario si tienes un endpoint tipo /me
  }, []);

  const login = (usuario, token, rol) => {
    dispatch({ type: 'LOGIN', payload: { usuario, token, rol } });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
