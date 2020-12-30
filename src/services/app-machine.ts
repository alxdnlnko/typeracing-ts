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


interface TAppContext {
}

interface TAppStateSchema {
  states: {
    init: {}
    gettingRaceInfo: {}
  }
}

type TAppEvent =
  | { type: 'CONNECTED' }
  | { type: 'INFO', data: { text: string } }


type TAppMachineConfig = MachineConfig<TAppContext, TAppStateSchema, TAppEvent>
export type TAppState = State<TAppStateSchema, TAppEvent>
export type TAppService = Interpreter<TAppContext, TAppStateSchema, TAppEvent>


const machineConfig: TAppMachineConfig = {
  initial: 'init',
  key: 'root',
  context: {
    conn: null,
  },
  states: {
    init: {
      on: {
        CONNECTED: {
          actions: 'apiGetRaceInfo',
          target: 'gettingRaceInfo',
        }
      }
    },
    gettingRaceInfo: {
      on: {
        INFO: {
          actions: (ctx, e) => console.log(e.data)
        }
      }
    }
  }
}

const machine = createMachine(machineConfig, {

})
export default machine
