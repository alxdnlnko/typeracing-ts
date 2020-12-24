import {
  createMachine,
  assign,
  MachineConfig,
} from 'xstate'


interface TRaceContext {
  text: string|null
  pos: number
  curWrongText: string
}

interface TRaceStateSchema {
  states: {
    init: {}
    countdown: {}
    race: {
      states: {
        valid: {}
        invalid: {}
        validate: {}
      }
    }
    finished: {}
  }
}

type TRaceEvent =
  | { type: 'INIT', text: string }
  | { type: 'KEY_DOWN', key: string }
  | { type: 'DELETE_CHAR' }
  | { type: 'DELETE_WORD' }

type TRaceMachineConfig = MachineConfig<TRaceContext, TRaceStateSchema, TRaceEvent>

const machineConfig: TRaceMachineConfig = {
  initial: 'init',
  key: 'root',
  context: {
    text: null,
    pos: 0,
    curWrongText: '',
  },
  states: {
    init: {
      on: {
        INIT: {
          target: 'countdown',
          actions: assign({
            text: (_, { text }) =>
              text
                .replace(/\n/, ' ')
                .replace(/\r\n/, ' ')
                .replace(/ +/, ' ')
                .trim(),
            pos: (_) => 0,
            curWrongText: (_) => '',
          }),
        }
      }
    },
    countdown: {
      after: {
        1000: 'race'
      }
    },
    race: {
      initial: 'valid',
      states: {
        valid: {
          on: {
            DELETE_CHAR: {
              actions: assign({
                pos: ({ text, pos }) =>
                  pos === 0 || text[pos - 1] === ' '
                    ? pos
                    : pos - 1
              }),
              target: 'validate',
            },
            DELETE_WORD: {
              actions: assign({
                pos: ({ text, pos }) =>
                  pos === 0 || text[pos - 1] === ' '  // prevent deleting prev word
                    ? pos
                    : text.slice(0, pos).lastIndexOf(' ') + 1
              }),
              target: 'validate',
            },
            KEY_DOWN: [
              {
                cond: ({ text, pos }, e) => e.key === text[pos],
                actions: assign({ pos: ctx => ctx.pos + 1 }),
                target: 'validate',
              },
              {
                actions: assign({ curWrongText: (ctx, e) => ctx.curWrongText + e.key }),
                target: 'validate',
              },
            ]
          }
        },
        invalid: {
          on: {
            KEY_DOWN: [
              {
                actions: assign({
                  curWrongText: ({ curWrongText }, { key }) => curWrongText + key
                })
              }
            ],
            DELETE_WORD: [
              {
                actions: assign({
                  curWrongText: (_) => '',
                  pos: ({ text, pos }) =>
                    pos === 0 || text[pos-1] === ' '
                      ? pos
                      : text.slice(0, pos).lastIndexOf(' ') + 1,
                }),
                target: 'validate',
              }
            ],
            DELETE_CHAR: [
              {
                actions: assign({
                  curWrongText: ({ curWrongText }) => curWrongText.slice(0, -1),
                }),
                target: 'validate',
              }
            ],
          }
        },
        validate: {
          on: {
            '': [
              { cond: ({ text, pos }) => text?.length === pos, target: '#root.finished' },
              { cond: ({ curWrongText }) => curWrongText === '', target: 'valid' },
              { target: 'invalid' },
            ]
          }
        }
      }
    },
    finished: {
    }
  }
}
const machine = createMachine(machineConfig)
export default machine
