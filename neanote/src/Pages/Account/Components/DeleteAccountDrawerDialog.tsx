import React from "react"
import { useScreenSize } from "../../../DisplayContext"
import { Button } from "../../../../components/@/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../../components/@/ui/dialog"
import { DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose, Drawer, DrawerDescription } from "../../../../components/@/ui/drawer"
import { DialogDescription } from "@radix-ui/react-dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../components/@/ui/card"
import { Input } from "../../../../components/@/ui/input"
import { Label } from "../../../../components/@/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/@/ui/tabs"
import { Checkbox } from "../../../../components/@/ui/checkbox"
import { useUser } from "../useUser"
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom"

export function DeleteAccountDrawerDialog() {
    const [open, setOpen] = React.useState(false)
    const {screenSize} = useScreenSize()
    const title = 'Delete account'
    const desc = "Are you absolutely sure?"

    if (screenSize !=='small') {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-fit">{title}</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-destructive font-bold">{title}</DialogTitle>
            </DialogHeader>
            <DialogDescription>
                {desc}
            </DialogDescription>
            <DeletionTabs setOpen={setOpen}/>

          </DialogContent>
        </Dialog>
      )
  }

  return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline">{title}</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-destructive font-bold">{title}</DrawerTitle>
          </DrawerHeader>
          <DrawerDescription>
            {desc}
          </DrawerDescription>
            <DeletionTabs setOpen={setOpen}/>

          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

const DeletionTabs = ({setOpen}) => {
    const [verified, setVerified] = React.useState(false)
    const [value,setValue] = React.useState<string>('verify')
    const [password,setPassword] = React.useState<string>('')
    const {deleteUser} = useUser()
    const navigate = useNavigate()

    const handleAccountDeletion = async () => {
        if( password.length >= 6) {
            const deleted = await deleteUser(password)
            if (deleted) {
                setOpen(false)
                Cookies.remove('token')
                navigate('/get-started') //TODO or to "sorry to see you go"
            }
        }
    }

    return (
        <Tabs defaultValue="verify" value={value} className="w-[400px] h-[280px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="verify">Verify</TabsTrigger>
            <TabsTrigger disabled={!verified} value="confirm">Confirm password</TabsTrigger>
          </TabsList>
          <TabsContent value="verify">
            <Card className="h-[230px]">
              <CardHeader>
                <CardTitle>Verify</CardTitle>
                <CardDescription>
                  Deleting your account will completely wipe your data from the database. This cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox onClick={()=>setVerified(!verified)} id="accept" />
                <Label
                    htmlFor="accept"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    I understand the consequences of deleting my account.
                </Label>
                </div>
              </CardContent>
              <CardFooter className="flex flex-row gap-2">
                <Button disabled={!verified} onClick={()=> setValue('confirm')}>Continue</Button>
                <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="confirm">
            <Card className="h-[230px]">
              <CardHeader>
                <CardTitle>Confirm Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="password">Account password</Label>
                  <Input value={password} onChange={e => setPassword(e.target.value)} id="password" type="password" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-row gap-2">
                <Button variant={'destructive'} onClick={handleAccountDeletion}>Delete account</Button>
                <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )
    }
