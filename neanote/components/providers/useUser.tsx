import {create }from 'zustand';

type User = {
  username: string;
  // Add more fields as needed
};

type UserStore = {
  user: User | null;
  isLoggedIn: boolean;
  loginUser: (username: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
};

export const useUser = create<UserStore>((set) => ({
  user: null,
  isLoggedIn: false,
  loginUser: (username: string) =>     set((state) => {
    console.log('Current state before loginUser:', state);
    const newState = { ...state, user: { username }, isLoggedIn: true };
    console.log('New state after loginUser:', newState);
    return newState;
  }),
  logout: () => set({ user: null, isLoggedIn: false }),
  updateUser: (user: User) => set((state) => ({ ...state, user })),
}));