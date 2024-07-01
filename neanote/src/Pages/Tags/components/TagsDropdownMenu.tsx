import * as React from "react";// Adjust the import path according to your project structure
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../../../components/@/ui/dropdown-menu";
import { useTasks } from "../../Tasks/useTasks";
import { Button } from "../../../../components/@/ui/button";
import { useTags } from "../useTags";

function TagsDropdownMenu({ onTagsSelected }) {
  const { tags,fetchTags } = useTags();
  const {selectedTagIds, setSelectedTagIds} = useTasks();
  if (tags.length < 1 ){
    fetchTags()
  }

  const [selectedTags, setSelectedTags] = React.useState([]);

  const handleTagChange = (tag, checked) => {
    setSelectedTags((prev) => {
      if (checked) {
        return [...prev, tag];
      } else {
        return prev.filter((t) => t !== tag);
      }
    });
    if (onTagsSelected) {
      setSelectedTagIds(selectedTags);
      console.log(selectedTags)
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Tags</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" className="w-40">
        {tags.map((tag) => (
          <DropdownMenuCheckboxItem
            key={tag.id} // Assuming each tag has a unique id
            checked={selectedTagIds.includes(tag.id)}
            onCheckedChange={(checked) => handleTagChange(tag, checked)}
          >
            {tag.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TagsDropdownMenu