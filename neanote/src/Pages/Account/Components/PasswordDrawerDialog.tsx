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
import { useUser } from "../useUser"

export function PasswordDrawerDialog() {
  const [open, setOpen] = React.useState(false)
  const {screenSize} = useScreenSize()
  
  if (screenSize !=='small') {
      return (
          <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <TriggerButton/>
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
        <TriggerButton/>
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

function TriggerButton() {
    return (
        <Button variant="destructive" className="w-fit">Change Password</Button>
    )
}

function ProfileForm({ className }: React.ComponentProps<"form">) {
    const {handleChangePassword, validationErrors} = useUser()
    const [form, setForm] = React.useState({
        password: "",
        newPassword: '',
    })

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        handleChangePassword(form.password, form.newPassword)
    }

    return (
    <form className={cn("grid items-start gap-4", className)} onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="password">Current password</Label>
        <Input value={form.password} onChange={e=>setForm({...form, password: e.target.value})} id="password" />
        {validationErrors.password && <p className="text-sm text-destructive">{validationErrors.password}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="new password">New password</Label>
        <Input value={form.newPassword} onChange={e=>setForm({...form, newPassword: e.target.value})} id="confirm password" />
        {validationErrors.newpassword && <p className="text-sm text-destructive">{validationErrors.newpassword}</p>}
      </div>
      <Button type="submit">Save</Button>
    </form>
  )
}