import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { UniversalType } from "../../api/types/ArchiveTypes";
import { universalApi } from "../../api/universalApi";

type CalendarState = {
    currentDate: Date;
    selectedDate: Date | null;
    notes: UniversalType[];
    daysInMonth: (month: number, year: number) => number;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    handleDateClick: (date: Date) => void;
    fetchNotes: (startDate: Date, endDate: Date) => void;
  };

export const useCalendar = create<CalendarState>()(
  immer((set, get) => ({
    currentDate: new Date(),
    selectedDate: null,
    notes: [],
    daysInMonth: (month: number, year: number) => {
      return new Date(year, month + 1, 0).getDate();
    },
    handlePrevMonth: () => {
      const { currentDate } = get();
      set((state) => {
        state.currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      });
    },
    handleNextMonth: () => {
      const { currentDate } = get();
      set((state) => {
        state.currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      });
    },
    handleDateClick: (date: Date) => {
      set((state) => {
        state.selectedDate = date;
      });
      console.log(`Date picked: ${date.toDateString()}`);
    },
    fetchNotes: async (startDate: Date, endDate: Date) => {
        try {
          const response = await universalApi.getDue(startDate.toISOString(),endDate.toISOString());
            if (response ) {
                set((state) => {
                  state.notes = response.data;
                });
            }
        } catch (error) {
          console.error("Failed to fetch notes:", error);
        }
      },
  }))
);