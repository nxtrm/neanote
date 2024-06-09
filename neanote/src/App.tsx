import { ThemeProvider } from "../components/providers/theme-provider"
import Layout  from "../components/Layout/Layout"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Layout>
        hi
      </Layout>
    </ThemeProvider>
  )
}

export default App
