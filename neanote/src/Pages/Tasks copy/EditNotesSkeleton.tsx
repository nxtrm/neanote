import React from 'react'
import {Skeleton} from '../../../components/@/ui/skeleton'
import PageContainer from '../../../components/PageContainer/PageContainer';

function EditNotesSkeleton() {
    return (
        <>
            <div className='flex row justify-between'>
                <Skeleton className="w-40"></Skeleton>
                <div className='flex gap-2'>
                    <Skeleton className='w-20 h-10' />
                    <Skeleton className='w-10' />
                </div>
            </div>
            <div className="space-y-2 py-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
            </div>
        </>
    );
}

export default EditNotesSkeleton