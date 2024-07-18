import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

type GoalState = {

}

export const useGoals = create<GoalState>()(
    immer((set, get) => ({


    })))