import React, { useEffect, useRef } from 'react';
import { cn } from '../@/lib/utils';
import { Textarea } from '../@/ui/textarea';

interface Props<T> {
    content: string;
    update: (key: keyof T, value: string) => void;
    placeholder?: string;
    className?: string;
  }

function AutoResizeTextBox<T>({ content, update, className, placeholder }: Props<T>) {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto'; // Reset height to auto
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`; // Set height to scrollHeight
      }
    }, [content]);

  return (
    <Textarea
      ref={textAreaRef}
      id="content"
      name="Content"
      className={cn('my-2 h-fit min-h-[10vh] max-h-[70vh] resize-none', className)}
      value={content}
      placeholder={placeholder}
      onChange={(e) => update('content' as keyof T, e.target.value)}
    />
  );
}

export default AutoResizeTextBox;