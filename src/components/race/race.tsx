import React, { useEffect, useState, KeyboardEvent } from 'react'
import { interpret } from 'xstate'

import styles from './styles.module.scss'
import BookIcon from './icons/book.svg'

import raceMachine from '/services/race-machine'

import RaceText from './race-text'
import RaceInput from './race-input'


const Book = () => {
  return (
    <div className={styles.book}>
      <BookIcon />
      <span>Дочь горного короля, отр. 20</span>
    </div>
  )
}

const initialText = `Баллистар знал, что на всем белом свете Сигурни дороги
только эти два создания – собака Леди и ястреб Эбби.
Девушка натаскивала обеих для совместной охоты. Леди поднимала зайцев,
Эбби стрелой бросалась с дерева на добычу. Но если заяц был только один,
между гончей и птицей начиналось соперничество.
`
const raceService = interpret(raceMachine)
raceService.start()

const Race = () => {
  const [ text, setText ] = useState<string>('')
  const [ pos, setPos ] = useState<number>(0)
  const [ val, setVal ] = useState<string>('')
  const [ isValid, setValid ] = useState<boolean>(true)
  const [ isFinished, setFinished ] = useState<boolean>(false)
  const [ wrongText, setWrongText ] = useState<string>('')
  const [ state, setState ] = useState<string>('')
  const [ isFocused, setFocused ] = useState<boolean>(false)

  useEffect(() => {
    const sub = raceService.subscribe(state => {
      setText(state.context.text)
      setPos(state.context.pos)
      setValid(!state.matches('race.invalid'))
      setFinished(state.matches('finished'))
      setWrongText(state.context.curWrongText)
      setState(state.toStrings().join(' '))

      console.log(state)
    })

    raceService.send({ type: 'INIT', text: initialText })
    return () => sub.unsubscribe()
  }, [])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!e.isTrusted) {
      e.preventDefault()
      return
    }
    setVal('')
    const { key } = e
    if (key === 'Backspace') {
      if (e.ctrlKey) raceService.send({ type: 'DELETE_WORD' })
      else raceService.send({ type: 'DELETE_CHAR' })
      return
    }
    if (key.length !== 1) {
      return
    }
    raceService.send({ type: 'KEY_DOWN', key })
  }

  return (
    <div className={styles.race} data-state={state} data-focused={isFocused}>
      <Book />
      <RaceText text={text} pos={pos} />
      <RaceInput text={text} pos={pos} wrongText={wrongText} />

      <input type="text"
        value={val}
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
