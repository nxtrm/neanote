import create from 'zustand';

type User = {
  username: string;
  isLoggedIn: boolean;
};

type UserStore = {
  user: User;
  login: (username: string) => void;
  logout: () => void;
};

export const useUser = create<UserStore>((set) => ({
  user: { username: '', isLoggedIn: false },
  login: (username: string) => set({ user: { username, isLoggedIn: true } }),
  logout: () => set({ user: { username: '', isLoggedIn: false } }),
}));