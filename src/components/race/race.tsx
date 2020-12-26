import React, { useEffect, useState, KeyboardEvent, useRef, useCallback } from 'react'
import { interpret } from 'xstate'

import styles from './styles.module.scss'
import BookIcon from './icons/book.svg'

import raceMachine from '/services/race-machine'
import { useRaceService } from './hooks'

import RaceText from './race-text'
import RaceInput from './race-input'


const Book = () => {
  return (
    <div className={styles.book}>
      <BookIcon />
      <span>The Adventures of Huckleberry Finn, part 208</span>
    </div>
  )
}

const initialText = `
  Я первый раз переживал подлинную, поднимавшуюся над самим собой мудрость,
  даже боль и смерть не ощущавшуюся личным переживанием,
  а считавшуюся надличностным объектом рассмотрения и наблюдения.
`

const raceService = interpret(raceMachine)
raceService.start()

const Race = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [ isFocused, setFocused ] = useState<boolean>(false)

  const [ raceInfo ] = useRaceService(raceService)
  useEffect(() => {
    raceService.send({ type: 'INIT', text: initialText })
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!e.isTrusted) {
      e.preventDefault()
      return
    }
    inputRef.current.value = ''
    const { key } = e

    if (e.ctrlKey && e.keyCode === 65) {  // ctrl + a
      raceService.send({ type: 'SELECT_ALL' })
      e.preventDefault()
      return
    }
    if (key === 'Backspace') {
      if (e.ctrlKey) raceService.send({ type: 'DELETE_WORD' })
      else raceService.send({ type: 'DELETE_CHAR' })
      return
    }
    if (e.ctrlKey) {
      return
    }
    if (key.length !== 1) {
      return
    }
    setTimeout(() => {
      raceService.send({ type: 'KEY_DOWN', key })
    }, 0)
  }, [ inputRef.current ])

  const onInputClick = useCallback(() => inputRef.current && inputRef.current.focus(), [ inputRef.current ])

  return (
    <div className={styles.race} data-state={raceInfo.state} data-focused={isFocused}>
      <Book />
      <RaceText text={raceInfo.text} pos={raceInfo.pos} hideCursor={true} />
      <RaceInput
        text={raceInfo.text}
        pos={raceInfo.pos}
        wrongText={raceInfo.wrongText}
        speed={raceInfo.speed}
        errorsCount={raceInfo.errorsCount}
        onClick={() => onInputClick()}
      />

      <input type="text"
        ref={inputRef}
        autoFocus
        onKeyDown={handleKeyDown}
        onChange={() => false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          opacity: '0'
        }}
      />
    </div>
  )
}
export default Race
