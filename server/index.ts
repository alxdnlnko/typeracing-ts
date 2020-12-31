import WebSocket from 'ws'
import { v4 as uuidv4 } from 'uuid'

// import { interpret } from 'xstate'

import { ServerToAppAPI, TAppToServerMessage, TServerToAppMessage } from '../src/shared/api'
// import raceMachine from './race-machine'

import * as Races from './models/racesRepo'
import * as Racers from './models/racersRepo'


const texts = [
  `С необычайной быстротой она разобрала мой приёмник. Я любовался её ловкими руками с длинными, подвижными пальцами. Говорили мы немного. Она очень скоро поправила аппарат и ушла к себе.`,
  `Она не знала, любовь это или нет, но всем своим сердцем и душой чувствовала одно: что больше всего на свете ей хочется спрятаться у него в кармане и вечно сидеть там в покое и безопасности.`,
  `Иногда ты должен побежать, чтобы увидеть, кто побежит за тобой. Иногда ты должен говорить мягче, чтобы увидеть, кто на самом деле прислушивается к тебе.`,
]

const wss = new WebSocket.Server({ port: 8080 });


// let raceService = interpret(raceMachine)
// raceService.subscribe(state => {
//   console.log()
//   console.log(state.toStrings())
//   console.log(state.context)
// })
// raceService.start()

// raceService.send({
//   type: 'INIT',
//   text: texts[Math.floor( Math.random() * texts.length )],
//   countdown: 5,
// })




// хранить заезды, рэйсеров и сокеты в отдельных объектах по айдишнику
// не связывать их друг с другом
// пересылать евенты


const initRacerAndRace = (racerId: string, ws: WebSocket) => {
  const racer = initRacer(racerId, ws)
  const race = initRace()
  racer.raceId = race.id
  race.racersIds.push(racer.id)
  Races.setById(race.id, race)
  Racers.setById(racer.id, racer)
}

const initRacer = (id: string, ws: WebSocket) => {
  // authenticate, get name

  const send = (data: TServerToAppMessage) => {
    ws.send(JSON.stringify(data))
  }
  const api = new ServerToAppAPI({ send })
  const racer = Racers.initRacer(id, api)
  return racer
}

const initRace = () => {
  const id = uuidv4()
  const text = texts[ Math.floor( Math.random() * texts.length ) ]
  return Races.initRace(id, text)
}


const race = initRace()
Races.setById(race.id, race)

const initRacerAndAddToRace = (racerId: string, ws: WebSocket, raceId: string) => {
  const race = Races.getById(raceId)
  const racer = initRacer(racerId, ws)
  Racers.setById(racer.id, racer)
  Races.addRacerToRaceById(race.id, racer.id)
  Racers.addRaceToRacerById(racer.id, race.id)

  racer.api.sendRaceInfo({ text: race.text, countdown: race.countdown })
}

const notifyRacersInRace = (raceId: string) => {
  const race = Races.getById(raceId)
  Racers
    .filterByIds(race.racersIds)
    .forEach(racer => racer.api.updateRacers())
}

const clientHandler = (ws: WebSocket) => {
  const id = uuidv4()
  initRacerAndAddToRace(id, ws, race.id)
  notifyRacersInRace(race.id)
  // initRacerAndRace(id, ws)

  ws.on('message', (message: string) => {
    const data = JSON.parse(message) as TAppToServerMessage
    console.log(data)
  });

  // api.ping()
}


wss.on('connection', function connection(ws) {
  clientHandler(ws)
});
