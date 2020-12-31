import { ServerToAppAPI } from '../../src/shared/api'


export interface TRacer {
  id: string
  pos: number
  raceId: string
  api: ServerToAppAPI
}

const racers: Record<string, TRacer> = {

}

export const getById = (id: string) => racers[id] || null
export const setById = (id: string, racer: TRacer) => { racers[id] = racer }
export const initRacer = (id: string, api: ServerToAppAPI): TRacer => ({
  id,
  api,
  pos: 0,
  raceId: '',
})
export const addRaceToRacerById = (id: string, raceId: string) => {
  if (!racers[id]) return
  racers[id] = { ...racers[id], raceId }
}
export const filterByIds = (ids: Array<string>) => ids.map(id => racers[id])
