import React, { useState } from 'react';
import { IoMenu } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../@/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger
} from "../@/ui/drawer";
import Title from "./Title";
import { modules } from './modules';
import { useScreenSize } from '../../src/DisplayContext';
import SearchBar from '../SearchBar/SearchBar';
import ThemeSwitcher from '../NavBar/ThemeSwitcher/ThemeSwitcher';
import LoginButton from '../NavBar/LoginButton/LoginButton';

function Sidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate()
  const {screenSize} = useScreenSize();

  const handleLinkClick = (link) => {
    setOpen(false);
    navigate(`/${link}`);
  };

  return (
    <Drawer direction="left" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="icon" variant="default"><IoMenu /></Button>
      </DrawerTrigger>
      <DrawerContent className="flex flex-col p-2 rounded-r-xl h-full w-[200px] mt-24 fixed bottom-0 right-0">
        <DrawerHeader className="pt-0 pb-1">
          <div className="flex flex-row gap-2">
            <Title font={"35px"}/>
          </div>
        </DrawerHeader>
          <div className="flex rounded-xl w-full h-full flex-col border-[2px] p-2">
            <div className="flex flex-col gap-4 ">
              {screenSize === 'small' && (
                <div className='flex justify-between gap-2'>
                  <SearchBar/>
                  <ThemeSwitcher/>
                  <LoginButton/>
               </div>)}
              <div>Calendar</div>
                {modules.map((module) => (
                <Button
                  variant={`${location.pathname.includes(module.link) ? "default" : "secondary"}` }
                  key={module.link}
                  onClick={() => handleLinkClick(module.link)}
                  disabled={module.disabled}
                  className={""}
                >
                  {module.text}
                </Button>
              ))}
            </div>
          </div>
        <DrawerFooter className="p-0 pt-2">
          <DrawerClose asChild>
            <Button className="w-full" variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}


export default Sidebar