import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "../../../../components/@/ui/dialog";
import { Button } from "../../../../components/@/ui/button";
import { useTags } from "../useTags";
import TagLabel from "./TagLabel";
import { Tag, Tags } from "lucide-react";

function TagsDropdownMenu() {
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
      <DialogContent className="mx-auto max-w-sm py-10">
        {tags.map((tag, index) => (
          <TagLabel
            key={index}
            tagId={tag.tagid}
            title={tag.name}
            color={tag.color}
          />
        ))}
      </DialogContent>
    </Dialog>
  );
}

export default TagsDropdownMenu;  