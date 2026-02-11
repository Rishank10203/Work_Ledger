// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import '../node_modules/bootstrap-icons/font/bootstrap-icons.css'
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.js';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"
import './App.css'
import store from "./Store/store"
// import '../src/assets/css'
import { Provider } from "react-redux"
import Routing from "./Components/Routing"

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
    <Provider store={store}>
      <Routing/>
    </Provider>
    </>
  )
}

export default App
