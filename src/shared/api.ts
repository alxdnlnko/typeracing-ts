
export interface TRaceInfo {
  text: string
  countdown: number
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



export type TServerToAppMessage =
  | { type: 'RACE_INFO', info: TRaceInfo }
  | { type: 'RACE_UPDATE' }
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

  updateRaceInfo() {
    this.sender.send({ type: 'RACE_UPDATE' })
  }
}
