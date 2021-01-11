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


const initRace = () => {
  const id = uuidv4()
  const text = texts[ Math.floor( Math.random() * texts.length )]
  return Races.initRace(id, text)
}


const race = initRace()
console.log(race)
Races.setById(race.id, race)


const initRacer = (id: string, name: string, ws: WebSocket) => {
  // authenticate, get name

  const send = (data: TServerToAppMessage) => {
    ws.send(JSON.stringify(data))
  }
  const api = new ServerToAppAPI({ send })
  const racer = Racers.initRacer(id, name, api)
  return racer
}

const initRacerAndRace = (racerId: string, racerName: string, ws: WebSocket) => {
  const racer = initRacer(racerId, racerName, ws)
  const race = initRace()
  racer.raceId = race.id
  race.racersIds.push(racer.id)
  Races.setById(race.id, race)
  Racers.setById(racer.id, racer)
}


const initRacerAndAddToRace = (racerId: string, racerName: string, ws: WebSocket, raceId: string) => {
  const race = Races.getById(raceId)
  const racer = initRacer(racerId, racerName, ws)
  Racers.setById(racer.id, racer)
  Races.addRacerToRaceById(race.id, racer.id)
  Racers.addRaceToRacerById(racer.id, race.id)

  racer.api.sendRaceInfo({
    racerId,
    text: race.text,
    countdown: race.countdown,
    racers: [
      ...Racers
        .filterByIds(race.racersIds)
        .map(racer => ({ id: racer.id, name: racer.name, progressPerc: 0, finished: false }))
    ]
  })
}

const notifyRacersInRace = (raceId: string) => {
  const race = Races.getById(raceId)
  const racersInfo =
    Racers
      .filterByIds(race.racersIds)
      .map(r => ({ id: r.id, pos: r.pos }))
  Racers
    .filterByIds(race.racersIds)
    .forEach(racer => racer.api.updateRacers(racersInfo))
}

const notifyRacerConnected = (raceId: string, racerId: string) => {
  const race = Races.getById(raceId)
  const racer = Racers.getById(racerId)
  const racerInfo = {
    id: racer.id,
    name: racer.name,
    progressPerc: 0,
    finished: false,
  }
  Racers
    .filterByIds(race.racersIds)
    .forEach(racer => racer.api.racerConnected(racerInfo))
}

const clientHandler = (ws: WebSocket) => {
  // get id and name from server
  const id = uuidv4()
  const name = 'alxdnlnko_' + Math.floor(Math.random() * 100)

  initRacerAndAddToRace(id, name, ws, race.id)
  notifyRacerConnected(race.id, id)
  // notifyRacersInRace(race.id)
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
