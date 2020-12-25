import React, { useLayoutEffect, useRef } from 'react'

import styles from './styles.module.scss'


type TProps = { text: string, pos: number, wrongText: string }
const RaceInput = ({ text, pos, wrongText }: TProps) => {
  const cursorRef = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const el = cursorRef.current
    if (el) {
      el.style.animation = 'none'
      requestAnimationFrame(() => {
        el.style.animation = ''
      })
    }
  }, [ pos, wrongText ])

  const startInd = Math.max(
    text
      .slice(0, Math.max(pos, 0))
      .lastIndexOf(' ') + 1,
    0
  )
  const curWord = pos === text.length
    ? ''
    : text.slice(startInd, pos)

  return (
    <div className={styles.input}>
      <span className={styles.inputWrapper}>
        <span className={styles.inputCurrentWord}>{curWord}</span>
        <span className={styles.inputWrongText}>{wrongText}</span>
        <span ref={cursorRef} className={styles.inputCursor}></span>
      </span>
    </div>
  )
}
export default RaceInput


