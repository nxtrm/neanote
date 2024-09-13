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
import { Tag } from "../../../api/types/tagTypes";
import { quicksort } from "../../../../components/utils";
import SortMenu from "../../../../components/SortMenu/SortMenu";

interface Props {
  onChange: () => void
}

function TagsDropdownMenu({onChange}:Props) {
  const { tags, setTags, fetchTags, order, setOrder} = useTags();

  React.useEffect(() => {
    if (tags.length < 1) {
      fetchTags();
    }
  }, [tags.length, fetchTags]);

  React.useEffect(() => {
    sort_tags(tags,order)
  },[order])

  function sort_tags(tags: Tag[], order: string) {

    const ascendingComparator = (a: Tag, b: Tag) => a.name.localeCompare(b.name);
    const descendingComparator = (a: Tag, b: Tag) => b.name.localeCompare(a.name);

    const comparator = order === 'ascending' ? ascendingComparator : descendingComparator;

    const sortedTags = quicksort(tags, comparator);
    setTags(sortedTags); // Update the tags array using setTags
  }

  return (
    <Dialog >
      <DialogTrigger asChild>
        <Button variant="secondary">Tags</Button>
      </DialogTrigger>
      <DialogContent className="mx-auto w-[50vw] ">
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
        <SortMenu order={order} setOrder={setOrder}/>
      </DialogContent>
    </Dialog>
  );
}
export default TagsDropdownMenu;