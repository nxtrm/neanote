import React, { useEffect, useState } from 'react';
import { Button } from '../@/ui/button';
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { Label } from '../@/ui/label';

interface PaginationSelectorProps {
    page: number;
    nextPage: number | null;
    fetchingFunction: (pageIndex: number) => void;
}

const PaginationSelector: React.FC<PaginationSelectorProps> = ({ fetchingFunction, nextPage, page }) => {
    const [currentPage, setCurrentPage] = useState(page);
    const [previousPage, setPreviousPage] = useState<number | null>(page > 1 ? page - 1 : null);
  
    useEffect(() => {
      setCurrentPage(page);
      setPreviousPage(page > 1 ? page - 1 : null);
    }, [page]);
  
    const handleFetchTaskPreviews = async (pageIndex: number) => {
      await fetchingFunction(pageIndex);
      setCurrentPage(pageIndex);
      setPreviousPage(pageIndex > 1 ? pageIndex - 1 : null);
    };
  
    const handleNextPage = () => {
      if (nextPage) {
        handleFetchTaskPreviews(nextPage);
      }
    };
  
    const handlePreviousPage = () => {
      if (previousPage !== null) {
        handleFetchTaskPreviews(previousPage);
      }
    };
  
    return (
      <div className='flex flex-row gap-2'>
        <Button size="icon" onClick={handlePreviousPage} disabled={currentPage === 1}>
          <IoIosArrowBack size={'20px'} />
        </Button>
        <div className='bg-primary rounded-md text-secondary p-[6px] text-center h-10 w-10'>{currentPage}</div>
        <Button size="icon" onClick={handleNextPage} disabled={nextPage ? false : true}>
          <IoIosArrowForward size={'20px'} />
        </Button>
      </div>
    );
  };
  
  export default PaginationSelector;