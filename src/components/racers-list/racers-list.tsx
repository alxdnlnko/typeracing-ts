import React, {} from 'react'

import styles from './styles.module.scss'

import Racer, { TRacerInfo } from './racer'


type TRacersListProps = { racers: Array<TRacerInfo>, raceState: string }
const RacersList = ({ racers, raceState }: TRacersListProps) => {
  return (
    <div className={styles.racersList} data-state={raceState}>
      { racers.map(
        (r, i) =>
          <Racer key={i} info={r} />
      )}
    </div>
  )
}
export default RacersList
