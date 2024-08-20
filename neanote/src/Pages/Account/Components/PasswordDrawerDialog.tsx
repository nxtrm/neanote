import * as React from "react"

import { cn } from "../../../../components/@/lib/utils"
import { Button } from "../../../../components/@/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/@/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../../../components/@/ui/drawer"
import { Input } from "../../../../components/@/ui/input"
import { Label } from "../../../../components/@/ui/label"
import { useScreenSize } from "../../../DisplayContext"

export function PasswordDrawerDialog() {
  const [open, setOpen] = React.useState(false)
  const {screenSize} = useScreenSize()
  
  if (screenSize !=='small') {
      return (
          <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="w-fit">Change</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <ProfileForm />
        </DialogContent>
      </Dialog>
    )
}

return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Change</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Change Password</DrawerTitle>
        </DrawerHeader>
        <ProfileForm className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ProfileForm({ className }: React.ComponentProps<"form">) {
    const [visible, setVisible] = React.useState(false)
    return (
        <form className={cn("grid items-start gap-4", className)}>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm password">Confirm password</Label>
        <Input id="confirm password" />
      </div>
      <Button type="submit">Save</Button>
    </form>
  )
}