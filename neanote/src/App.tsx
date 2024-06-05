import { useState } from 'react'
import './App.css'
import Layout from '../components/Layout/Layout'
import { ThemeProvider } from 'next-themes'

function App() {

  return (
    <ThemeProvider 
    attribute='class'
    defaultTheme='system'
    enableSystem={true}
    disableTransitionOnChange={true}
    >
      <Layout>
         hi
      </Layout>
    </ThemeProvider>
  )
}

export default App
