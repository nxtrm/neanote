import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../../../../components/@/ui/dialog";
import { Button } from "../../../../components/@/ui/button";
import { useTags } from "../useTags";
import TagLabel from "./TagLabel";

interface Props {
  onChange: () => void
}

function TagsDropdownMenu({onChange}:Props) {
  const { tags, fetchTags} = useTags();

  React.useEffect(() => {
    if (tags.length < 1) {
      fetchTags();
    }
  }, [tags.length, fetchTags]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Tags</Button>
      </DialogTrigger>
      <DialogContent className="mx-auto w-fit">
        <DialogHeader className="px-2 pt-2 text-xl font-bold">
          Tags
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <TagLabel
              key={index}
              tagId={tag.tagid}
              title={tag.name}
              color={tag.color}
              onChange={onChange}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default TagsDropdownMenu;