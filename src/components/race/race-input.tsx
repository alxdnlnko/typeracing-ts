import React, { useLayoutEffect, useRef, UIEventHandler } from 'react'

import styles from './styles.module.scss'


type TProps = { text: string, pos: number, wrongText: string, onClick: UIEventHandler }
const RaceInput = ({ text, pos, wrongText, onClick }: TProps) => {
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
    <div className={styles.input} onClick={e => onClick && onClick(e)}>
      <span className={styles.inputWrapper}>
        <span className={styles.inputCurrentWord}>{curWord}</span>
        <span className={styles.inputWrongText}>{wrongText}</span>
        <span ref={cursorRef} className={styles.inputCursor}></span>
      </span>
    </div>
  )
}
export default RaceInput


