import React, {} from 'react'

import styles from './styles.module.scss'


export interface TRacerInfo {
  name: string
  progressPerc: number
  finished: boolean
  speed?: string
  errors?: number
  place?: number
}
type TRacerProps = { info: TRacerInfo }
const Racer = ({ info }: TRacerProps) => {
  return (
    <div className={styles.racer}>
      <div className={styles.name}>
        {info.name}
      </div>

      <div
        className={styles.progress}
        style={{['--perc' as any]: info.progressPerc}}
      ></div>
    </div>
  )
}
export default Racer

