import * as React from "react";// Adjust the import path according to your project structure
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "../../../../components/@/ui/dialog";
import { useTasks } from "../../Tasks/useTasks";
import { Button } from "../../../../components/@/ui/button";
import { useTags } from "../useTags";
import TagLabel from "./TagLabel";

function TagsDialog({ onTagsSelected }) {
  const { tags,fetchTags } = useTags();
  const {selectedTagIds} = useTasks();
  if (tags.length < 1 ){
    fetchTags()
  }

  return (
    <Dialog >
      <DialogTrigger asChild>
        <Button variant="secondary">Tags</Button>
      </DialogTrigger>
      <DialogContent className="mx-auto w-full max-w-sm py-10">
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

export default TagsDialog