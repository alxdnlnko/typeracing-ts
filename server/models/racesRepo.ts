import { TRacer } from './racersRepo'


interface TRace {
  id: string
  text: string
  countdown: number
  racersIds: Array<string>
}

const races: Record<string, TRace> = {

}


export const getById = (id: string) => races[id] || null
export const setById = (id: string, race: TRace) => { races[id] = race }
export const initRace = (id: string, text: string, countdown?: number): TRace => ({
  id,
  text,
  countdown: countdown || 5,
  racersIds: []
})
export const addRacerToRaceById = (id: string, racerId: string) => {
  if (!races[id]) return
  races[id] = { ...races[id], racersIds: [ ...races[id].racersIds, racerId ]}
}
