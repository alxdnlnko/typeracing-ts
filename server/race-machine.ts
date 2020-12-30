import {
  createMachine,
  assign,
  MachineConfig,
  State,
  Interpreter,
  spawn,
  SpawnedActorRef,
  send,
} from 'xstate'


interface TRacer {
  name: string
  pos: number
  latencyMsec: number
  localStartTime: number
}

interface TRaceContext {
  text: string
  countdown: number
  racers: Array<TRacer>
}

interface TRaceStateSchema {
  states: {
    init: {}
    waitingRacers: {}
  }
}

type TRaceEvent = { type: 'INIT', text: string, countdown: number }


type TRaceMachineConfig = MachineConfig<TRaceContext, TRaceStateSchema, TRaceEvent>
export type TRaceState = State<TRaceStateSchema, TRaceEvent>
export type TRaceService = Interpreter<TRaceContext, TRaceStateSchema, TRaceEvent>


const machineConfig: TRaceMachineConfig = {
  initial: 'init',
  context: {
    text: '',
    countdown: 5,
    racers: [],
  },
  states: {
    init: {
      on: {
        INIT: {
          actions: assign({
            text: ({ text }, e) => e.type === 'INIT' ? e.text : text,
            countdown: ({ countdown }, e) => e.type === 'INIT' ? e.countdown : countdown,
          }),
          target: 'waitingRacers',
        }
      }
    },
    waitingRacers: {
      on: {}
    }
  }
}

const machine = createMachine(machineConfig)
export default machine
