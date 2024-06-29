import { create } from 'zustand';
import { Tag } from '../../api/types/tagTypes';
import tagsApi from '../../api/tagsApi';
type TagState = {
    section: string;
    setSection: (section: string) => void;
    tags : Tag[]
    fetchTags: () => Promise<void>;
}

export let useTags = create<TagState>((set, get) => {
    return {
        tags: [],
        section: 'all tags',
        setSection: (section) => set({ section }),

        fetchTags: async () => {
            const fetchedTags = await tagsApi.getAll();
            if (fetchedTags)  {
        
              set({ tags: fetchedTags.data });
            }
          },
    }

})