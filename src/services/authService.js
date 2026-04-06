import { users } from './mockData';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function login(email, password) {
  await delay();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid email or password');
  const { password: _, ...safeUser } = user;
  return { user: safeUser, token: `mock-token-${user.id}` };
}

export async function register({ name, email, password }) {
  await delay();
  if (users.find((u) => u.email === email)) {
    throw new Error('Email already in use');
  }
  const newUser = {
    id: String(users.length + 1),
    name,
    email,
    password,
    role: 'user',
    avatar: null,
  };
  users.push(newUser);
  const { password: _, ...safeUser } = newUser;
  return { user: safeUser, token: `mock-token-${newUser.id}` };
}
