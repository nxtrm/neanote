import { FaEdit, FaTasks } from "react-icons/fa";
import { UniversalType } from "../../../src/api/types/ArchiveTypes";
import { MdRepeat } from "react-icons/md";
import { LuGoal } from "react-icons/lu";
import TagLabel from "../../TagLabel/TagLabel.tsx"
import React from "react";
import { Button } from "../../@/ui/button";
import { useNavigate } from "react-router-dom";
import './SearchCard.css';
import UniversalCard from "../../Universal/UniversalCard.tsx";

function SearchCard({ note, onCloseDialog }: { note: UniversalType, onCloseDialog: () => void }) {
    const navigate = useNavigate();

    function handleEditClick(noteId, type) {
        localStorage.setItem(`current${type.charAt(0).toUpperCase() + type.slice(1)}Id`, noteId.toString());
        navigate(`/${type + 's'}/edit`);
        onCloseDialog();
    }

    return (
        <UniversalCard note={note} handleEditClick={handleEditClick} />
    );
}

export default SearchCard;