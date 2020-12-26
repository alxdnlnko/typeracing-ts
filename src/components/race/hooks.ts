import { useEffect, useState, KeyboardEvent, useRef } from 'react'

import { TRaceService } from '/services/race-machine'


interface TRaceInfo {
  text: string
  pos: number
  wrongText: string
  state: Array<string>
  speed: string
  errorsCount: number
  countdown: number
}
export const useRaceService = (raceService: TRaceService) => {
  const [ info, setInfo ] = useState<TRaceInfo>({
    text: '',
    pos: 0,
    wrongText: '',
    state: [],
    speed: '',
    errorsCount: 0,
    countdown: 0
  })
  useEffect(() => {
    const sub = raceService.subscribe(state => {
      const { text, pos, wrongText, speed, errorsCount, countdown } = state.context

      setInfo({
        text,
        pos,
        wrongText,
        speed,
        state: state.toStrings(),
        errorsCount,
        countdown,
      })
      // console.log(state)
      console.log(state.toStrings().join(' '), countdown)
    })
    return () => sub.unsubscribe()
  }, [])
  return [ info ]
}
