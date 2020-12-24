import React from 'react'

import styles from './styles.module.scss'

import RaceTextWord from './race-text-word'


type TProps = { text: string, pos: number }
const RaceText = ({ text, pos }: TProps) => {
  const wordsInfo = text
    .split(' ')
    .map(w => `${w} `)
    .map(w => ({ text: w, startPos: 0, endPos: 0, ind: 0 }))

  let prevWordsLen = 0
  let ind = 0
  for (let w of wordsInfo) {
    w.ind = ind++
    w.startPos = prevWordsLen
    w.endPos = w.startPos + w.text.length - 1
    prevWordsLen += w.text.length
  }

  return (
    <div className={styles.text}>
      { wordsInfo.map(
        (w, i) =>
          <RaceTextWord
            key={i}
            word={w}
            pos={pos}
          />
      )}
    </div>
  )
}
export default RaceText

