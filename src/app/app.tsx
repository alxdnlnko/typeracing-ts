import React, { useEffect, useState, KeyboardEvent } from 'react'
import { interpret } from 'xstate'

import raceMachine from './race-machine'
import RaceText from '../race-text'

const initialText = `
  Dolor quos unde ex explicabo temporibus Et numquam officia.
`

// const raceService = interpret(raceMachine.withContext({ ...raceMachine.context, text }))
const raceService = interpret(raceMachine)
raceService.start()


const App = () => {
  const [ text, setText ] = useState<string>('')
  const [ pos, setPos ] = useState<number>(0)
  const [ val, setVal ] = useState<string>('')
  const [ isValid, setValid ] = useState<boolean>(true)
  const [ isFinished, setFinished ] = useState<boolean>(false)
  const [ wrongText, setWrongText ] = useState<string>('')
  const [ state, setState ] = useState<string>('')

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

  const color = isFinished ? 'green' : isValid ? '#aaa' : 'red'

  return (
    <div>
      {/*

      <div>{text}</div>
      <pre
        style={{
          background: color,
          display: 'inline-block',
          padding: '8px'
        }}
      >{text.slice(0, pos)}</pre>

      */}
      <RaceText text={text} state={state} wrongText={wrongText} pos={pos} />

      <pre>{JSON.stringify({ pos, wrongText, state })}</pre>

      <div>
        <input type="text"
          value={val}
          onKeyDown={handleKeyDown}
          onChange={() => null}
          style={{
            opacity: '0'
          }}
        />
      </div>
    </div>
  )
}
export default App
