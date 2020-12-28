import {
  createMachine,
  assign,
  MachineConfig,
  State,
  Interpreter,
} from 'xstate'



export interface TConnContext {
}

interface TConnStateSchema {
  states: {
    init: {}
  }
}

export type TConnEvent = { type: 'START' }


type TConnMachineConfig = MachineConfig<TConnContext, TConnStateSchema, TConnEvent>
export type TConnState = State<TConnStateSchema, TConnEvent>
export type TConnService = Interpreter<TConnContext, TConnStateSchema, TConnEvent>


const machineConfig: TConnMachineConfig = {
  initial: 'init',
  key: 'root',
  context: {
    conn: null,
  },
  states: {
    init: {
      invoke: {
        src: () => new Promise(resolve => {
          resolve(new WebSocket('ws://localhost:8080/'))
        })
      }
    },
  }
}

const machine = createMachine(machineConfig, {

})
export default machine

