export type TRacerInfo = { id: string, name: string, progressPerc: number, finished: boolean }

export interface TRaceInfo {
  racerId: string
  text: string
  countdown: number
  racers: Array<TRacerInfo>
}

export type TAppToServerMessage =
  | { type: 'GET_RACE_INFO', raceId: string }
  | { type: 'PONG' }

type TAppSender = { send: (message: TAppToServerMessage) => void }

export class AppToServerAPI {
  constructor(private sender: TAppSender) { }

  pong() {
    this.sender.send({ type: 'PONG' })
  }

  getRaceInfo(raceId: string) {
    this.sender.send({ type: 'GET_RACE_INFO', raceId })
  }
}



export type TRacerPosInfo = { id: string, pos: number }
export type TRacersPosInfo = Array<TRacerPosInfo>
export type TServerToAppMessage =
  | { type: 'RACE_INFO', info: TRaceInfo }
  | { type: 'UPDATE_RACERS', info: TRacersPosInfo }
  | { type: 'RACER_CONNECTED', info: TRacerInfo }
  | { type: 'PING' }

type TServerSender = { send: (message: TServerToAppMessage) => void }

export class ServerToAppAPI {
  constructor(private sender: TServerSender) { }

  ping() {
    this.sender.send({ type: 'PING' })
  }

  sendRaceInfo(info: TRaceInfo) {
    this.sender.send({ type: 'RACE_INFO', info })
  }

  racerConnected(info: TRacerInfo) {
    this.sender.send({ type: 'RACER_CONNECTED', info })
  }

  updateRacers(info: TRacersPosInfo) {
    this.sender.send({ type: 'UPDATE_RACERS', info })
  }
}
