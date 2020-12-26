import React, {} from 'react'

import styles from './styles.module.scss'

import Racer, { TRacerInfo } from './racer'


type TRacersListProps = { racers: Array<TRacerInfo> }
const RacersList = ({ racers }: TRacersListProps) => {
  return (
    <div className={styles.racersList}>
      { racers.map(
        (r, i) =>
          <Racer key={i} info={r} />
      )}
    </div>
  )
}
export default RacersList
