import React, { useEffect, useState } from 'react';
import { FaSearch } from "react-icons/fa";
import { searchApi } from '../../src/api/searchApi';
import { UniversalType } from '../../src/api/types/ArchiveTypes';
import { useScreenSize } from '../../src/DisplayContext';
import { Button } from "../@/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger
} from "../@/ui/dialog";
import { Input } from "../@/ui/input";
import { Label } from "../@/ui/label";
import PaginationSelector from '../Pagination/PaginationSelector';
import SearchCard from './Components/SearchCard';
import ToggleButtons from './ToggleButtons';

function SearchBar() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeMode, setActiveMode] = useState<'approximate' | 'exact'>('exact');
    const [results, setResults] = useState<UniversalType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [pagination, setPagination] = useState<{ nextPage: number | null; page: number; } | undefined>(undefined);

    const {screenSize} = useScreenSize()

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
                <Button size={screenSize == 'small' ? 'icon' : 'default'} className={`rounded-xl ${screenSize == 'small' ? 'w-[65px]' : ''} px-5 gap-2`} onClick={() => setIsDialogOpen(true)}>
                    <FaSearch className='justify-self-start' size={10} />
                    {screenSize != 'small' && <Label>Search...</Label>}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[500px] h-fit items-center">
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
                {results.length>0 && 
                <>
                    <div className='flex-col flex gap-2'>
                        {results.map(result => (
                            <SearchCard key={result.noteid} note={result} onCloseDialog={handleCloseDialog} />
                            ))}
                    </div>
                    {(pagination && results) && <PaginationSelector page={pagination?.page} nextPage={pagination?.nextPage} fetchingFunction={handleSearch}/>}
                </>
                }
            </DialogContent>
        </Dialog>
    );
}

export default SearchBar;