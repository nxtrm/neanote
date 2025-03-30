import React from "react";
import { useNavigate } from "react-router-dom";
import { UniversalType } from "../../../src/api/types/ArchiveTypes";
import UniversalCard from "../../Universal/UniversalCard.tsx";
import './SearchCard.css';

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