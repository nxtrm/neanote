import React from 'react'
import { Button } from "../../@/ui/button"
import { LuMoon ,LuSun } from "react-icons/lu";
import { useTheme } from "../../providers/theme-provider"

function ThemeSwitcher() {
    const [themeIsDark,setThemeIsDark] = React.useState(true)
  const { setTheme } = useTheme()
return (
    <div className='bg-secondary rounded-xl border-[2px] w-10 h-10 flex items-center justify-center' onClick={() => 
        {setTheme(themeIsDark ? "light" : "dark")
        setThemeIsDark(!themeIsDark)}
    }>
        {themeIsDark ? <LuMoon size={20}/> : <LuSun size={20}/>}
    </div>
)
}

export default ThemeSwitcher