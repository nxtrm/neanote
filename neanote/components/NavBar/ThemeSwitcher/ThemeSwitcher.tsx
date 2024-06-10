import React from 'react'
import { Button } from "../../@/ui/button"
import { LuMoon ,LuSun } from "react-icons/lu";
import { useTheme } from "../../providers/theme-provider"

function ThemeSwitcher() {
    const [themeIsDark,setThemeIsDark] = React.useState(true)
  const { setTheme } = useTheme()
return (
    <Button variant="secondary" onClick={() => 
        {setTheme(themeIsDark ? "light" : "dark")
        setThemeIsDark(!themeIsDark)}
    }>
        {themeIsDark ? <LuMoon /> : <LuSun />}
    </Button>
)
}

export default ThemeSwitcher