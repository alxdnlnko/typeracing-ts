import React, {} from 'react'

import styles from './styles.module.scss'


type TLetterInfo = { char: string, state: string }
type TWordInfo = { text: string, startPos: number, endPos: number, ind: number }
type TWordOpts = { word: TWordInfo, pos: number }
const RaceTextWord = ({ word, pos }: TWordOpts) => {
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
export default RaceTextWord
