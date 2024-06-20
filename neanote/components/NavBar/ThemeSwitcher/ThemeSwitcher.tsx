import React from 'react'
import { Button } from "../../@/ui/button"
import { LuMoon ,LuSun } from "react-icons/lu";
import { useTheme } from "../../providers/theme-provider"

function ThemeSwitcher() {
    const [themeIsDark,setThemeIsDark] = React.useState(true)
  const { setTheme } = useTheme()
return (

        <Button className='rounded-xl border-[2px]' variant="secondary" onClick={() => 
            {setTheme(themeIsDark ? "light" : "dark")
            setThemeIsDark(!themeIsDark)}
        } size="icon">
          {themeIsDark ? <LuMoon size={20}/> : <LuSun size={20}/>}
        </Button>
)
}

export default ThemeSwitcher