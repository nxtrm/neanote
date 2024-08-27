import React from "react";
import { FaTasks, FaArchive, FaTags } from "react-icons/fa";
import { LuGoal } from "react-icons/lu";
import { MdRepeat } from "react-icons/md";
import {FaRegNoteSticky } from 'react-icons/fa6';

export const modules = [
    { link: 'notes', text: (
      <div className="flex items-center gap-2">
          <FaRegNoteSticky /> Notes
      </div>
    ), disabled: false },
    {
      link: 'tasks',
      text: (
        <div className="flex items-center gap-2">
          <FaTasks /> Tasks
        </div>
      ),
      disabled: false,
    },
    {
      link: 'goals',
      text: (
        <div className="flex items-center gap-2">
          <LuGoal /> Goals
        </div>
      ),
      disabled: false,
    },
    {
      link: 'habits',
      text: (
        <div className="flex items-center gap-2">
          <MdRepeat /> Habits
        </div>
      ),
      disabled: false,
    },
    { link: 'events', text: 'Events', disabled: true },
    {
      link: 'archive',
      text: (
        <div className="flex items-center gap-2">
          <FaArchive /> Archive
        </div>
      ),
      disabled: false,
    },
    {
      link: 'tags',
      text: (
        <div className="flex items-center gap-2">
          <FaTags /> Tags
        </div>
      ),
      disabled: false,
    },
  ];