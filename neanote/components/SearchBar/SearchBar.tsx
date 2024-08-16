import React, { useEffect, useState } from 'react';
import PaginationSelector from '../Pagination/PaginationSelector'
import { FaSearch } from "react-icons/fa";
import { Button } from "../@/ui/button";
import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogHeader,
    DialogTrigger
} from "../@/ui/dialog";
import { Input } from "../@/ui/input";
import { Label } from "../@/ui/label";
import ToggleButtons from './ToggleButtons';
import { ArchiveType } from '../../src/api/types/archiveTypes';
import { searchApi, SearchResponse } from '../../src/api/searchApi';
import SearchCard from './Components/SearchCard';

function SearchBar() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeMode, setActiveMode] = useState<'approximate' | 'exact'>('exact');
    const [results, setResults] = useState<ArchiveType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [pagination, setPagination] = useState<{ nextPage: number | null; page: number; } | undefined>(undefined);

    useEffect(() => {
        if (searchQuery.length < 2 || !isDialogOpen )
            setResults([]);
        },[searchQuery, isDialogOpen]);

    const handleSearch = async (pageIndex:number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await searchApi.search(searchQuery, activeMode, pageIndex);
            if (response && response.data) {
                setResults(response.data);
                setPagination(response.pagination)
            }
        } catch (err) {
            setError('An error occurred while searching.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && searchQuery.length > 1) {
            handleSearch(1);
        } 
    };
    const handleOpenDialog = () => {
        setIsDialogOpen(true);
        setResults([]);
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setResults([]);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className='rounded-xl px-5 w-[125px] gap-2' onClick={() => setIsDialogOpen(true)}>
                    <FaSearch className='justify-self-start' size={10} />
                    <Label>Search...</Label>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] items-center">
                <div className="flex w-full items-center space-x-2">
                    <Input
                        type="string"
                        className='border-0'
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder='Type here'
                    />
                    <ToggleButtons activeMode={activeMode} setActiveMode={setActiveMode} />
                </div>
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}
                <div className='flex-col flex gap-2'>
                    {results && results.map(result => (
                        <SearchCard key={result.noteid} note={result} onCloseDialog={handleCloseDialog} />
                    ))}
                </div>
                {pagination && <PaginationSelector page={pagination?.page} nextPage={pagination?.nextPage} fetchingFunction={handleSearch}/>}
            </DialogContent>
        </Dialog>
    );
}

export default SearchBar;