import create from 'zustand';
import { z } from 'zod';
import { loginFormSchema } from '../../../formValidation';

type FormState = z.infer<typeof loginFormSchema>;

type FormStore = {
  formState: FormState;
  setFormState: (formState: FormState) => void;
};

export const useFormStore = create<FormStore>((set) => ({
  formState: { username: '', password: ''},
  setFormState: (formState) => set({ formState }),
}));