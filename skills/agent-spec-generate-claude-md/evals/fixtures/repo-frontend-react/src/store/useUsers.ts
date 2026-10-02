import { create } from "zustand";

// State global mora em stores zustand sob src/store. NÃO usar Context API para estado de servidor.
type User = { id: string; name: string };

type UsersState = {
  users: User[];
  setUsers: (u: User[]) => void;
};

export const useUsers = create<UsersState>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
}));
