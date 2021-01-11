import { useEffect, useState, KeyboardEvent, useRef } from 'react'

import { TRaceService } from '/services/race-machine'


interface TRacerInfo {
  id: string
  name: string
  progressPerc: number
  finished: boolean
}

interface TRaceInfo {
  racerId: string
  text: string
  pos: number
  wrongText: string
  state: Array<string>
  speed: string
  errorsCount: number
  countdown: number
  racers: Array<TRacerInfo>
}
export const useRaceService = (raceService: TRaceService) => {
  const [ info, setInfo ] = useState<TRaceInfo>({
    racerId: '',
    text: '',
    pos: 0,
    wrongText: '',
    state: [],
    speed: '',
    errorsCount: 0,
    countdown: 0,
    racers: [],
  })
  useEffect(() => {
    const sub = raceService.subscribe(state => {
      const { racerId, text, pos, wrongText, speed, errorsCount, countdown, racers } = state.context

      setInfo({
        racerId,
        text,
        pos,
        wrongText,
        speed,
        state: state.toStrings(),
        errorsCount,
        countdown,
        racers,
      })
      // console.log(state)
      // console.log(state.toStrings().join(' '), countdown)
    })
    return () => sub.unsubscribe()
  }, [])
  return [ info ]
}
