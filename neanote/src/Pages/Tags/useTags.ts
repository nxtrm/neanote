import { create } from 'zustand';
import { Tag } from '../../api/types/tagTypes';
import tagsApi from '../../api/tagsApi';

type TagState = {
    section: string;
    setSection: (section: string) => void;
    tags: Tag[];
    fetchTags: () => Promise<void>;
    tagTitle: string;
    setTagTitle: (title: string) => void;
    color: string;
    setColor: (color: string) => void;
    currentTagId: number | undefined;
    setCurrentTagId: (tagId: number) => void;
    selectedTagIds: number[];
    setSelectedTagIds: (tagIds: number[]) => void;
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
    color: '#000000',
    section: 'all tags',
    setSection: (section) => set({ section }),
    setTagTitle: (title) => set({ tagTitle: title }),
    setColor: (color) => set({ color }),
    fetchTags: async () => {
        const fetchedTags = await tagsApi.getAll();
        if (fetchedTags) {
            set({ tags: fetchedTags.data });
        }
    },
    handleSaveTag: async () => {
        const { tagTitle, color } = get();
        await tagsApi.create(tagTitle, color);
        await get().fetchTags();
        set({ tagTitle: '', color: '#000000' });
        set({ section: 'all tags' });
    },
    setSelectedTagIds: (tagIds) => set({ selectedTagIds: tagIds }),
    setCurrentTagId: (tagId) => set({ currentTagId: tagId }),
    handleDeleteTag: async () => {
        const { currentTagId } = get();
        if (currentTagId === undefined) return;
        if (await tagsApi.delete(currentTagId)) {
            await get().fetchTags();
            set({ section: 'all tags' });
        }
    },
    handleEditTag: async () => {
        const { currentTagId, tagTitle, color } = get();
        if (currentTagId === undefined) return;
        if (await tagsApi.edit(currentTagId, tagTitle, color)) {
            await get().fetchTags();
            set({ tagTitle: '', color: '#000000' });
            set({ section: 'all tags' });
        }
    },
}));

