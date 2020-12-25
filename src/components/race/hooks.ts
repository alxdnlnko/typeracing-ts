import { useEffect, useState, KeyboardEvent, useRef } from 'react'

import { TRaceService } from '/services/race-machine'


interface TRaceInfo {
  text: string
  pos: number
  wrongText: string
  state: string
}
export const useRaceService = (raceService: TRaceService) => {
  const [ info, setInfo ] = useState<TRaceInfo>({ text: '', pos: 0, wrongText: '', state: '' })
  useEffect(() => {
    const sub = raceService.subscribe(state => {
      setInfo({
        text: state.context.text,
        pos: state.context.pos,
        wrongText: state.context.wrongText,
        state: state.toStrings().join(' '),
      })
      // console.log(state)
    })
    return () => sub.unsubscribe()
  }, [])
  return [ info ]
}
