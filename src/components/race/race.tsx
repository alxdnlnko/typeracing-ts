import React, { useEffect, useState, KeyboardEvent, useRef, useCallback } from 'react'
import { interpret } from 'xstate'
import { Decimal } from 'decimal.js'

import styles from './styles.module.scss'
import BookIcon from './icons/book.svg'

import raceMachine from '/services/race-machine'
import { useRaceService } from './hooks'

import RaceText from './race-text'
import RaceInput from './race-input'
import RacersList from '/components/racers-list'


const Book = () => {
  return (
    <div className={styles.book}>
      <BookIcon />
      <span>Book title, part 208</span>
    </div>
  )
}

const initialText = `
  Как бы ни хоронили мы свои воспоминания, историю своей жизни не сотрёшь.
  И как раз об этом лучше не забывать. Историю не стереть и не переделать.
  Это всё равно что уничтожить самого себя.
`

const racer = {
  name: 'alxdnlnko',
  progressPerc: 0,
  finished: false
}

const raceService = interpret(raceMachine)
raceService.start()

const Race = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [ isFocused, setFocused ] = useState<boolean>(false)

  const [ raceInfo ] = useRaceService(raceService)
  useEffect(() => {
    raceService.send({ type: 'INIT', text: initialText, countdown: 3 })
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
    if (key === 'Enter') {
      raceService.send({ type: 'START' })
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

  const statusText =
    raceInfo.state.includes('waiting')
      ? `Ожидание игроков. Нажмите Enter, чтобы начать`
    : raceInfo.state.includes('countdown.waiting')
      ? `Старт через ${raceInfo.countdown} с.`
    : raceInfo.state.includes('countdown.ready')
      ? `Старт через ${raceInfo.countdown} с.`
    : ''

  const perc = Decimal.div(raceInfo.pos, Decimal.div(raceInfo.text.length, 100)).toNumber()

  return (
    <div className={styles.race} data-state={raceInfo.state.join(' ')} data-focused={isFocused}>
      <Book />
      <RaceText text={raceInfo.text} pos={raceInfo.pos} hideCursor={true} />
      <RaceInput
        text={raceInfo.text}
        pos={raceInfo.pos}
        wrongText={raceInfo.wrongText}
        speed={raceInfo.speed}
        errorsCount={raceInfo.errorsCount}
        status={statusText}
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

      <RacersList racers={[ { ...racer, progressPerc: perc }, ]} />
    </div>
  )
}
export default Race
