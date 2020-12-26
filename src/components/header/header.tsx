import React from 'react'

import styles from './styles.module.scss'


const Header = () => {
  return (
    <div className={styles.header}>
      <div className={styles.title}>
        <h1>Typeracing</h1>
        <h3>Открытая игра</h3>
      </div>
      <div className={styles.user}>
        <span>Username</span>
        <div className={styles.avatar}></div>
      </div>
    </div>
  )
}
export default Header
