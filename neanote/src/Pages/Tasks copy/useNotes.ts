import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import notesApi from '../../api/notesApi';
import { Note,  NoteResponse } from '../../api/types/noteTypes';
import { useTags } from '../Tags/useTags';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';
import { NoteSchema } from '../../formValidation';
import { z } from 'zod';
import { showToast } from '../../../components/Toast';
import utilsApi from '../../api/archiveApi';

const generateNewCurrentNote = () => {

  return {
    noteid: uuidv4(),
    title: '',
    tags: [],
    content: '',
  };
};

type NoteState = {
  loading:boolean;
  setLoading: (loading: boolean) => void;

  section: string;
  setSection: (section: string) => void;

  currentNote: Note;

  resetCurrentNote: () => void;
  updateCurrentNote: (key: keyof Note, value: any) => void;

  notes: Note[];

  handleSaveNote: () => Promise<boolean>;
  handleEditNote: () => Promise<void>;
  handleDeleteNote: (noteId:UUID) => Promise<void>;

  archive: (noteId:UUID) => Promise<void>;

  fetchNotePreviews: (pageParam:number) => Promise<void>;
  fetchNote: (noteId:string) => Promise<void>;
  nextPage: number | null;
  page:number

  pendingChanges:boolean
  setPendingChanges(value: boolean): void;

  validationErrors: Record<string, string | undefined>;
  validateNote: () => boolean;
};

export const useNotes = create<NoteState>()(
  immer((set, get) => ({
    section: 'all notes',
    selectedTagIds: [],
    notes: [],
    loading: false,
    validationErrors: {},
    currentNote: generateNewCurrentNote(),
    page: 1,
    nextPage:null,

    pendingChanges: false,

    setPendingChanges: (value) => set({pendingChanges: value}),

    setLoading : (loading) => set({ loading }),

    setSection: (section) => set({ section }),

    validateNote: () => {
      const { currentNote } = get();
      const result = NoteSchema.safeParse(currentNote);
      if (!result.success) {
        set((state) => {
          const errors = Object.fromEntries(
            Object.entries(result.error.flatten().fieldErrors).map(([key, value]) => [key, value.join(", ")])
          );
          state.validationErrors = errors;
          console.log(state.validationErrors)
        });
        console.log(currentNote)
        return false;
      } else {
        set((state) => {
          state.validationErrors = {};
        });
        return true;
      }
    },

      updateCurrentNote: <K extends keyof Note>(key: K, value: Note[K]) => {
        set((state) => {
          if (state.currentNote) {
            state.currentNote[key] = value;

          }
          if (!state.pendingChanges) {
            state.pendingChanges = true;
          }

        });
        get().validateNote();
    },

      archive: async (noteId: UUID) => {
        const response = await utilsApi.archive(noteId);
        if (response.success) {
          set((state) => {
            state.notes = state.notes.filter((note) => note.noteid !== noteId);
          });
          showToast('success', 'Note archived successfully');
        } else {
          showToast('error', response.message);
        }
      },

      resetCurrentNote: () => {
        useTags.getState().selectedTagIds = [];
        set((state) => {
          state.section = 'all notes';
          state.currentNote = generateNewCurrentNote()
          state.pendingChanges = false;
        })
      },


      fetchNotePreviews: async (pageParam: number) => {
        set({ loading: true });
        try {
          const response = await notesApi.getNotePreviews(pageParam);
          if (response && response.success) {
            set({ notes: response.data, nextPage: response.nextPage, page: response.page });
          }
          else {
            showToast('error', response.message);
          }
        } finally {
          set({ loading: false });
        }
      },

      fetchNote: async (noteId: string) => {
        const{setSelectedTagIds} = useTags.getState();
        set({ loading: true });
        try {
          const response = await notesApi.getNote(noteId);
          if (response.success && response.data) {
            set((state) => {
              state.currentNote = response.data;
            });
            if (response.data.tags)
              setSelectedTagIds(response.data.tags.map(tag=>tag.tagid));
          } else {
            showToast('error', response.message);
          }
        } finally {
          set({ loading: false });
        }
      },


      handleSaveNote: async () => {
        const { currentNote } = get();
        const { selectedTagIds } = useTags.getState();
        if (get().validateNote()) {
          const response = await notesApi.create(currentNote.title, selectedTagIds, currentNote.content);
          if (response.data && response.success) {
            set((state) => {
              state.notes.push({ ...currentNote, noteid: response.data.noteid });
              state.pendingChanges = false;
            });
            localStorage.setItem('currentNoteId', response.data.noteid.toString());
            showToast('success', 'Note created successfully');
            return true;
          } else {
            showToast('error', response.message);
          }
        } else {
          showToast('error', 'Validation failed');
        }
        return false;
      },

      handleEditNote: async () => {
        const { currentNote} = get();
        const { selectedTagIds } = useTags.getState();
        try {
          if (get().validateNote()) {
            const updatedNote = { ...currentNote, tags: selectedTagIds };
            const response = await notesApi.update(updatedNote);

          if (response && response.success) {
            set((state) => {
              state.notes = state.notes.map((note) => (note.noteid === currentNote.noteid ? currentNote : note));
              state.pendingChanges = false;
              state.loading = false;
            });
          } else {
            showToast('error', response.message);
          }
          } else {
            showToast('error', 'Validation failed');
          }

        } finally {
        }
      },

      handleDeleteNote: async (noteId: UUID) => {
        if (noteId && noteId) {
          const previousNotes = get().notes;

          set((state) => {
            state.notes = state.notes.filter((note) => note.noteid !== noteId);
          });

          const response = await notesApi.delete(noteId);
          if (response && response.success) {
              showToast('success', 'Note deleted successfully')
          } else {
              set({ notes: previousNotes }); //revert
              showToast('error', response.message);
          }

        }
      },
  }))
);
