import { create } from 'zustand';
import { Tag } from '../../api/types/tagTypes';
import tagsApi from '../../api/tagsApi';
import { UUID } from 'crypto';

type TagState = {
    section: string;
    setSection: (section: string) => void;
    tags: Tag[]; 
    setTags: (tags: Tag[]) => void;
    order: string
    setOrder: (order: string)=>void;
    fetchTags: () => Promise<void>;
    tagTitle: string;
    setTagTitle: (title: string) => void;
    color: string;
    setColor: (color: string) => void;
    currentTagId: UUID | undefined;
    setCurrentTagId: (tagId: UUID) => void;
    selectedTagIds: UUID[];
    setSelectedTagIds: (tagIds: UUID[]) => void;
    // updateState: (key: keyof TagState, value: any) => void;
    handleSaveTag: () => void;
    handleDeleteTag: () => void;
    handleEditTag: () => void;
};

export const useTags = create<TagState>((set, get) => ({
    tags: [],
    tagTitle: '',
    currentTagId: undefined,
    selectedTagIds: [],
    order: 'ascending',
    color: '#000000',
    section: 'all tags',
    setSection: (section) => set({ section }),
    setTagTitle: (title) => set({ tagTitle: title }),
    setTags:(tags)=>set({tags}),
    setColor: (color) => set({ color }),
    setOrder: (order) => set({ order }),

    fetchTags: async () => {
        const fetchedTags = await tagsApi.getAll();
        if (fetchedTags) {
            set({ tags: fetchedTags.data });
        }
    },
    handleSaveTag: async () => {
        const { tagTitle, color,tags } = get();
        const response = await tagsApi.create(tagTitle, color);
        if (response && response.success) {
            set({tagTitle: '', color: '#000000', section: 'all tags' });
            set((state) => {
                state.tags.push({
                    tagid: response.tagid,
                    name: tagTitle,
                    color: color
                });
                return state;
            })
        }
    },

    setSelectedTagIds: (tagIds) => set({ selectedTagIds: [...tagIds] }),

    setCurrentTagId: (tagId) => set({ currentTagId: tagId }),

    handleDeleteTag: async () => {
        const { currentTagId,tags } = get();
        if (currentTagId === undefined) return;
        const response = await tagsApi.delete(currentTagId);
        if (response  && response.success) {
            set({tags:tags.filter(tag => tag.tagid != currentTagId ) , section: 'all tags' });
        }
    },

    handleEditTag: async () => {
        const { currentTagId, tagTitle, color,tags } = get();
        if (currentTagId === undefined) return;
        const response = await tagsApi.edit(currentTagId, tagTitle, color);
        if (response.success) {
            set({
                tags: tags.map(tag => tag.tagid == currentTagId ? { ...tag, name: tagTitle, color } : tag),
                tagTitle: '', color: '#000000',
                section: 'all tags'
            });
        }
    },
}));

