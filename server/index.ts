import WebSocket from 'ws'
import { interpret } from 'xstate'

import { ServerToAppAPI, TAppToServerMessage, TServerToAppMessage } from '../src/shared/api'
import raceMachine from './race-machine'


const texts = [
  `С необычайной быстротой она разобрала мой приёмник. Я любовался её ловкими руками с длинными, подвижными пальцами. Говорили мы немного. Она очень скоро поправила аппарат и ушла к себе.`,
  `Она не знала, любовь это или нет, но всем своим сердцем и душой чувствовала одно: что больше всего на свете ей хочется спрятаться у него в кармане и вечно сидеть там в покое и безопасности.`,
  `Иногда ты должен побежать, чтобы увидеть, кто побежит за тобой. Иногда ты должен говорить мягче, чтобы увидеть, кто на самом деле прислушивается к тебе.`,
]

const wss = new WebSocket.Server({ port: 8080 });


let raceService = interpret(raceMachine)
raceService.subscribe(state => {
  console.log()
  console.log(state.toStrings())
  console.log(state.context)
})
raceService.start()

raceService.send({
  type: 'INIT',
  text: texts[Math.floor( Math.random() * texts.length )],
  countdown: 10,
})


const clientHandler = (ws) => {
  const send = (data: TServerToAppMessage) => {
    ws.send(JSON.stringify(data))
  }
  const api = new ServerToAppAPI({ send })

  ws.on('message', (message: string) => {
    try {
      var data = JSON.parse(message) as TAppToServerMessage
    } catch(err) {
      console.log(err)
      return
    }

    // console.log(wss.clients)
    console.log(data)

    if (data.type === 'GET_RACE_INFO') {
      const { state } = raceService
      if (state.matches('waitingRacers')) {
        const { context } = state
        api.sendRaceInfo({ text: context.text, countdown: context.countdown })
      }
    }
  });

  api.ping()
}


wss.on('connection', function connection(ws) {
  clientHandler(ws)
});
