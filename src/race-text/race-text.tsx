import React, {} from 'react'

import styles from './styles.module.scss'


type TOpts = { text: string, state: string, pos: number, wrongText: string }
const RaceText = ({ text, state, pos, wrongText }: TOpts) => {
  const doneText = text.slice(0, pos)
  const nextText = text.slice(pos)
  return (
    <div className={styles.raceText} data-state={state}>
      <span className="done-text" style={{opacity: '.5', transform: 'scale(.5)'}}>{doneText}</span>
      <span className="cursor" style={{borderRight: '2px solid #333'}}></span>
      <span className="next-text">{nextText}</span>
    </div>
  )
}
export default RaceText

