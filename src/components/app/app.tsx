import React, { useEffect } from 'react'
import { interpret } from 'xstate'

import raceMachine from '/services/race-machine'
import appMachine from '/services/app-machine'

import './global-styles.scss'
import styles from './styles.module.scss'

import Header from '/components/header'
import Race from '/components/race'

import { AppToServerAPI, TAppToServerMessage, TServerToAppMessage } from '/shared/api'


const initialText = `
  С необычайной быстротой она разобрала мой приёмник. Я любовался её ловкими руками с длинными, подвижными пальцами. Говорили мы немного. Она очень скоро поправила аппарат и ушла к себе.
`


const ws = new WebSocket('ws://localhost:8080/')

const send = (conn) => (data: TAppToServerMessage) => {
  conn.send(JSON.stringify(data))
}
const api = new AppToServerAPI({ send: send(ws) })

const appService = interpret(appMachine.withConfig({
  actions: {
    apiGetRaceInfo: () => {
      // ws.send(JSON.stringify({ type: 'INFO', raceId: '1' }))
      api.getRaceInfo('1')
    }
  }
}))
const raceService = interpret(raceMachine.withConfig({ }))



ws.addEventListener('open', () => {
  appService.send({ type: 'CONNECTED' })
})
ws.addEventListener('message', (message) => {
  const msg = JSON.parse(message.data) as TServerToAppMessage
  console.log(msg)
  switch (msg.type) {
    case 'RACE_INFO':
      raceService.send({ type: 'INIT', text: msg.info.text, countdown: msg.info.countdown })
      break
    case 'PING':
      api.pong()
      break
  }
})





appService.subscribe(state => {
  console.log(state)
})
appService.start()

raceService.start()


const App = () => {

  useEffect(() => {
    // setTimeout(() => {
    //   raceService.send({ type: 'INIT', text: initialText, countdown: 3 })
    // }, 2000)
  }, [])

  return (
    <div className={styles.app}>
      <Header />
      <Race raceService={raceService} />
    </div>
  )
}
export default App
