import React, { useEffect, useState } from 'react'
import { Card,CardContent } from '../@/ui/card'
import { Button } from '../@/ui/button'
import { FaCopy, FaShare } from "react-icons/fa6";
import { IoSparkles } from "react-icons/io5";
import { universalApi } from '../../src/api/universalApi';
import SummarizeDialog from '../SummarizeDialog/SummarizeDialog';

function TextSelectPopover() {
    const [state, setState] = useState<string>();
    const [selection, setSelection] = useState<string>();
    const [position, setPosition] = useState<Record<string, number>>();
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [dialogText, setDialogText] = useState<string>('');
    let rect;
    let selectedText = '';

    function onSelectStart(event) {
        const target = event.target as HTMLElement;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
            setState('selecting');
            setSelection(undefined);
        }
    }

    const onMouseUp = (event) => {
        const target = event.target as HTMLElement;

        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
            const input = target as HTMLInputElement | HTMLTextAreaElement;
            selectedText = input.value.substring(input.selectionStart ?? 0, input.selectionEnd ?? 0);
            rect = input.getBoundingClientRect();
        }

        if (selectedText) {
            setSelection(selectedText);
            setPosition({
                x: rect.left + (rect.width / 2),
                y: rect.top
            });
        } else {
            setSelection(undefined);
            setPosition(undefined);
        }
    };

    const onDocumentClick = (event) => {
        const target = event.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') {
            setSelection(undefined);
            setPosition(undefined);
        }
    };

    useEffect(() => {
        document.addEventListener('selectstart', onSelectStart);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('click', onDocumentClick);

        return () => {
            document.removeEventListener('selectstart', onSelectStart);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('click', onDocumentClick);
        };
    }, []);

    const handleSummarize = (text: string) => {
        const response = universalApi.summarize(text);
        response.then((result) => {
            if (result && result.success) {
                setDialogText(result.data.data);
                setDialogOpen(true);
            }
        });
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelection(undefined);
        setPosition(undefined);
    };

    return (
        <div role="dialog" aria-labelledby="tooltip" aria-haspopup="dialog">
            {(selection && position) && (
                <div
                    className="
                        absolute -top-[40px] left-0 w-[90px] bg-primary h-[35px] rounded m-0
                        after:absolute after:top-full after:left-1/2 after:-translate-x-2 after:h-0 after:w-0 after:border-x-[6px] after:border-x-transparent after:border-b-[8px] after:border-b-black after:rotate-180
                        flex flex-row gap-2 justify-center items-center p-2
                    "
                    style={{
                        transform: `translate3d(${position.x}px, ${position.y}px, 0)`
                    }}
                >
                    <Button className='h-[30px] w-[30px]' name='paste' size='icon'><FaShare /></Button>
                    <Button className='h-[30px] w-[30px]' onClick={() => handleSummarize(selection)}  name='summarize with ai' size='icon'><IoSparkles /></Button>
                </div>
            )}
            {dialogOpen && <SummarizeDialog onClose={closeDialog} text={dialogText} />
 }
        </div>
    );
}

export default TextSelectPopover;