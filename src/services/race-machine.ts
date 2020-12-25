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
        selected: {}
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
  | { type: 'SELECT_ALL' }

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
                .replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, ' ')
                .replace(/ +/g, ' ')
                .replace(/–/g, '-')
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
            ],
            SELECT_ALL: 'selected',
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
            SELECT_ALL: 'selected',
          }
        },
        selected: {
          on: {
            KEY_DOWN: [
              {  // key matches the beginning of current word
                cond: ({ text, pos }, { key }) => {
                  const wordPos = pos === 0 || text[pos-1] === ' '
                    ? pos
                    : text.slice(0, pos).lastIndexOf(' ') + 1
                  return text[wordPos] === key
                },
                actions: assign({
                  curWrongText: (_) => '',
                  pos: ({ text, pos }) =>
                    pos === 0 || text[pos-1] === ' '
                      ? pos + 1
                      : text.slice(0, pos).lastIndexOf(' ') + 2
                }),
                target: 'validate',
              },
              {
                actions: assign({
                  curWrongText: (ctx, e) => ctx.curWrongText + e.key,
                  pos: ({ text, pos }) =>
                    pos === 0 || text[pos-1] === ' '
                      ? pos
                      : text.slice(0, pos).lastIndexOf(' ') + 1,
                }),
                target: 'validate',
              },
            ],
            DELETE_CHAR: [
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
            ]
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
