import React from 'react'

import styles from './styles.module.scss'

import RaceWord from './race-word'


type TProps = { text: string, pos: number, hideCursor?: boolean }
const RaceText = ({ text, pos, hideCursor }: TProps) => {
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
    <div className={styles.text} data-hidecursor={hideCursor}>
      { wordsInfo.map(
        (w, i) =>
          <RaceWord
            key={i}
            word={w}
            pos={pos}
          />
      )}
    </div>
  )
}
export default RaceText

