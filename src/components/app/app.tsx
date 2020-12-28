import React, { useEffect } from 'react'
import { interpret } from 'xstate'

import raceMachine from '/services/race-machine'
import appMachine from '/services/app-machine'

import './global-styles.scss'
import styles from './styles.module.scss'

import Header from '/components/header'
import Race from '/components/race'


const initialText = `
  С необычайной быстротой она разобрала мой приёмник. Я любовался её ловкими руками с длинными, подвижными пальцами. Говорили мы немного. Она очень скоро поправила аппарат и ушла к себе.
`

const raceService = interpret(raceMachine)
raceService.start()

const appService = interpret(appMachine)
appService.subscribe(state => {
  console.log(state)
})
appService.start()

const App = () => {
  // useEffect(() => {
  //   const ws = new WebSocket('ws://localhost:8080/')
  //   ws.addEventListener('open', () => {
  //     console.log('open')
  //     ws.send('some')
  //   })
  //   ws.addEventListener('message', (msg) => {
  //     console.log('message')
  //   })
  // }, [])

  useEffect(() => {
    setTimeout(() => {
      raceService.send({ type: 'INIT', text: initialText, countdown: 3 })
    }, 2000)
  }, [])

  return (
    <div className={styles.app}>
      <Header />
      <Race raceService={raceService} />
    </div>
  )
}
export default App
