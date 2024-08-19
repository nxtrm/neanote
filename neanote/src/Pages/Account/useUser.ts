import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { UserSettings } from "../../api/types/userTypes";
import users from "../../api/users";

interface Userstate {
    user: UserSettings | undefined;
}

export const useUser = create<Userstate>()(
    immer((set, get) => ({
        user: undefined,

        getUser: async () => {
            const response = await users.getUser()
            if (response) {
                set((state) => {
                    state.user = response;
                })
        }},

    })))