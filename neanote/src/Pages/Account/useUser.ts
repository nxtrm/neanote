import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { UserSettings } from "../../api/types/userTypes";
import users from "../../api/users";
import { PasswordSchema, UserSettingsSchema } from "../../formValidation";

interface Userstate {
    user: UserSettings | undefined;
    getUser : () => Promise<void>;
    deleteUser: (password:string) => Promise<boolean>;

    currentUser: UserSettings
    updateCurrentUser: (key: keyof UserSettings, value: any) => void;
    updateUser: (updateData: object) => void;

    pendingChanges:boolean

    validationErrors: Record<string, string | undefined>;
    validateUser: () => boolean;
    validatePassword: (password: string, newpassword: string) => boolean;

    loading: boolean;
    handleUpdateDetails: () => void;
    handleUpdatePreferences: () => void;
    handleChangePassword: (password: string, newpassword:string, setOpen: (boolean)=>void) => void
}

export const useUser = create<Userstate>()(
    immer((set, get) => ({
      user: undefined,
      pendingChanges: false,
      validationErrors: {},
      loading: false,
  
      currentUser: {
        username: '',
        email: '',
        password: '',
        preferences: {
          theme: 'system',
          model: 'default',
        }
      },
  
      validateUser: () => {
        const { currentUser } = get();
        const result = UserSettingsSchema.safeParse(currentUser);
        if (!result.success) {
          set((state) => {
            const errors = Object.fromEntries(
              Object.entries(result.error.flatten().fieldErrors).map(([key, value]) => [key, value.join(", ")])
            );
            state.validationErrors = errors;
          });
          return false;
        } else {
          set((state) => {
            state.validationErrors = {};
          });
          return true;
        }
      },

      validatePassword: (password: string, newpassword: string) => {
        const result = PasswordSchema.safeParse({ password, newpassword });
        if (!result.success) {
          set((state) => {
            const errors = Object.fromEntries(
              Object.entries(result.error.flatten().fieldErrors).map(([key, value]) => [key, value.join(", ")])
            );
            state.validationErrors = errors;
          });
          return false;
        } else if (password === newpassword) {
          set((state) => {
            state.validationErrors = { newpassword: "New password must be different from the old password" };
          });
          return false;
        }
        else {
          set((state) => {
            state.validationErrors = {};
          });
          return true;
        }
      },
      updateCurrentUser: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
        set((state) => {
          if (state.currentUser) {
            state.currentUser[key] = value;
          }
          if (!state.pendingChanges) {
            state.pendingChanges = true;
          }
        });
        get().validateUser();
      },
  
      updateUser: async (updateData: object) => {
          const { currentUser, validateUser } = get();
          if (validateUser()) {
              set((state) => {
                  state.loading = true;
              });
              const response = await users.updateUserDetails(updateData);
              if (response) {
                  set((state) => {
                      state.loading = false;
                      state.pendingChanges = false;
                  });
              }
          }
      },

      handleUpdateDetails: async () => {
        const {updateUser, currentUser} = get();
          await updateUser({
              username: currentUser.username,
              email: currentUser.email,
          });
      },
      
      handleUpdatePreferences: async () => {
        const {updateUser, currentUser} = get();
          await updateUser({
              preferences: currentUser.preferences,
          });
      },

      handleChangePassword: async (password:string, newpassword: string, setOpen: (boolean)=> void) => {
        const { validatePassword } = get();
        if (validatePassword(password, newpassword)) {
          const response = await users.changePassword(password, newpassword);
          if (response && response.success) {
            setOpen(false)
            //close dialog
          }
        }
      },

      getUser: async () => {
        const response = await users.getUser();
        if (response) {
          set((state) => {
            state.user = response;
            state.currentUser = {
              username: response.username,
              email: response.email,
              preferences: response.preferences,
            };
          });
        }
      },

      deleteUser: async (password:string) => {
        const response = await users.deleteUser(password);
        if (response && response.success) {
          return true
        }
        else {
          return false
        }
      }
    }))
  );