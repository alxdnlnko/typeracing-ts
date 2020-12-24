import React, {} from 'react'

import styles from './styles.module.scss'


type TLetterInfo = { char: string, state: string }
type TWordInfo = { text: string, startPos: number, endPos: number, ind: number }
type TWordOpts = { word: TWordInfo, pos: number, wrongText: string }
const Word = ({ word, pos, wrongText }: TWordOpts) => {
  const wordState =
    word.endPos < pos ? 'prev'
    : word.startPos > pos ? 'next'
    : 'current'

  const letters: Array<TLetterInfo> = word.text
    .split('')
    .map((l, i) => ({
      char: l,
      state: word.startPos + i < pos ? 'prev'
        : word.startPos + i > pos ? 'next'
        : 'current'
    }))

  return (
    <span
      className={styles.word}
      data-wordstate={wordState}
      style={{['--i' as any]: word.ind}}
    >
      { letters.map(
        (l, i) =>
          <span
            className={styles.letter}
            key={i}
            data-letterstate={l.state}
          >
            {l.char}
          </span>
      )}
    </span>
  )
}

type TOpts = {
  text: string,
  state: string,
  pos: number,
  wrongText: string
}
const RaceText = ({ text, state, pos, wrongText }: TOpts) => {
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
    <div className={styles.raceText} data-state={state}>
      { wordsInfo.map(
        (w, i) =>
          <Word
            key={i}
            word={w}
            pos={pos}
            wrongText={wrongText}
          />
      )}
    </div>
  )
}
export default RaceText

