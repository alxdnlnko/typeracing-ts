import React, { useLayoutEffect, useRef, UIEventHandler } from 'react'

import styles from './styles.module.scss'


type TStatusProps = { text: string }
const Status = ({ text }: TStatusProps) => {
  return (
    <div className={styles.status}>
      <span>{text}</span>
    </div>
  )
}


type TStatsProps = { speed: string, errorsCount: number }
const Stats = ({ speed, errorsCount }: TStatsProps) => {
  return (
    <div className={styles.stats}>
      <span>{speed && speed.split('.')[0] || 0} зн/мин</span>
      <span>{errorsCount || 0} ош.</span>
    </div>
  )
}

interface TProps {
  text: string
  pos: number
  wrongText: string
  onClick: UIEventHandler
  speed: string
  errorsCount: number
  status: string
}
const RaceInput = ({ text, pos, wrongText, onClick, speed, errorsCount, status }: TProps) => {
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
      <Status text={status} />
      <Stats speed={speed} errorsCount={errorsCount} />
    </div>
  )
}
export default RaceInput


