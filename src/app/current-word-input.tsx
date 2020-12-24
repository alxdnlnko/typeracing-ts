import React, {} from 'react'

import styles from './styles.module.scss'


type TOpts = { text: string, pos: number, wrongText: string }
const CurrentWordInput = ({ text, pos, wrongText }: TOpts) => {
  const startInd = Math.max(
    text
      .slice(0, Math.max(pos, 0))
      .lastIndexOf(' '),
    0
  )
  const curWord = pos === text.length
    ? ''
    : text.slice(startInd, pos) + wrongText

  return (
    <input className={styles.currentWordInput} type="text" value={curWord} onChange={() => false} />
  )
}
export default CurrentWordInput
