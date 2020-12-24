import React from 'react'

import './global-styles.scss'
import styles from './styles.module.scss'

import Header from '/components/header'
import Race from '/components/race'


const App = () => {
  return (
    <div className={styles.app}>
      <Header />
      <Race />
    </div>
  )
}
export default App
