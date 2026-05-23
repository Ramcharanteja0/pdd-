import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Simulated user store (would be backend API in production)
const USERS_KEY = 'crowdiq_users';
const SESSION_KEY = 'crowdiq_session';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
  });

  const register = async ({ name, email, password, org, role }) => {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('An account with this email already exists.');
    }
    const newUser = { id: Date.now(), name, email, password, org, role, createdAt: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const session = { id: newUser.id, name, email, org, role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  };

  const login = async ({ email, password }) => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid email or password. Please try again.');
    const session = { id: found.id, name: found.name, email: found.email, org: found.org, role: found.role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
