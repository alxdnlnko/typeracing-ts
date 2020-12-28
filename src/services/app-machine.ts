import {
  createMachine,
  assign,
  MachineConfig,
  State,
  Interpreter,
  spawn,
  SpawnedActorRef,
} from 'xstate'

// import ConnMachine, { TConnContext, TConnEvent } from './conn-machine'


type TConnEvent =
  | { type: 'MESSAGE', message: string }

interface TAppContext {
  conn: SpawnedActorRef<any> | null
}

interface TAppStateSchema {
  states: {
    init: {}
    connecting: {}
    connected: {}
  }
}

type TAppEvent =
  | { type: 'CONNECTED' }
  | { type: 'MESSAGE', message: string }


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
        '': {
          actions: assign({
            conn: (_) => spawn((cb, onReceive) => {
              const ws = new WebSocket('ws://localhost:8080/')
              ws.addEventListener('open', () => {
                cb({ type: 'CONNECTED' })
              })
              ws.addEventListener('message', (message) => {
                cb({ type: 'MESSAGE', message: message.data })
              })
              onReceive((e) => {
                if (e.type === 'MESSAGE') ws.send((e as TConnEvent).message)
              })
            })
          }),
          target: 'connecting',
        }
      }
    },
    connecting: {
      on: {
        CONNECTED: 'connected'
      }
    },
    connected: {
      on: {
        MESSAGE: {
          actions: (_, e) => console.log(e)
        }
      }
    }
  }
}

const machine = createMachine(machineConfig, {

})
export default machine
