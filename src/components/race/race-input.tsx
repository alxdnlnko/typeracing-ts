import React from 'react'

import styles from './styles.module.scss'


type TProps = { text: string, pos: number, wrongText: string }
const RaceInput = ({ text, pos, wrongText }: TProps) => {
  const startInd = Math.max(
    text
      .slice(0, Math.max(pos, 0))
      .lastIndexOf(' '),
    0
  )
  const curWord = pos === text.length
    ? ''
    : text.slice(startInd, pos)
  return (
    <div className={styles.input}>
      <span className={styles.inputCurrentWord}>{curWord}</span>
      <span className={styles.inputWrongText}>{wrongText}</span>
      <span className={styles.inputCursor}></span>
    </div>
  )
}
export default RaceInput


