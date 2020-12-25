import { useEffect, useState, KeyboardEvent, useRef } from 'react'

import { TRaceService } from '/services/race-machine'


interface TRaceInfo {
  text: string
  pos: number
  wrongText: string
  state: string
  speed: number
}
export const useRaceService = (raceService: TRaceService) => {
  const [ info, setInfo ] = useState<TRaceInfo>({
    text: '',
    pos: 0,
    wrongText: '',
    state: '',
    speed: 0,
  })
  useEffect(() => {
    const sub = raceService.subscribe(state => {
      const { text, pos, wrongText, speed } = state.context

      setInfo({
        text,
        pos,
        wrongText,
        speed,
        state: state.toStrings().join(' '),
      })
      // console.log(state)
    })
    return () => sub.unsubscribe()
  }, [])
  return [ info ]
}
