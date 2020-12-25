import {
  createMachine,
  assign,
  MachineConfig,
  State,
  Interpreter,
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
export type TRaceState = State<TRaceStateSchema, TRaceEvent>
export type TRaceService = Interpreter<TRaceContext, TRaceStateSchema, TRaceEvent>

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
              actions: 'deleteOneCharOfCurrentWord',
              target: 'validate',
            },
            DELETE_WORD: {
              actions: 'deleteCurrentWord',
              target: 'validate',
            },
            KEY_DOWN: [
              {
                cond: 'keyMatchesCurrentPos',
                actions: 'incPos',
                target: 'validate',
              },
              {
                actions: 'addKeyToWrongText',
                target: 'validate',
              },
            ],
            SELECT_ALL: [
              {
                cond: 'hasAnyText',
                target: 'selected',
              }
            ]
          }
        },
        invalid: {
          on: {
            KEY_DOWN: [
              {
                actions: 'addKeyToWrongText',
              }
            ],
            DELETE_WORD: [
              {
                cond: 'wrongTextHasSpacesInMiddle',
                actions: 'deleteLastWordFromWrongText',
                target: 'validate',
              },
              {
                actions: 'deleteCurrentWordAndClearWrongText',
                target: 'validate',
              }
            ],
            DELETE_CHAR: [
              {
                actions: 'deleteOneWrongChar',
                target: 'validate',
              }
            ],
            SELECT_ALL: 'selected',
          }
        },
        selected: {
          on: {
            KEY_DOWN: [
              {
                cond: 'keyMatchesStartOfCurrentWord',
                actions: 'deleteCurrentWordAndWrongTextAndIncPos',
                target: 'validate',
              },
              {
                actions: 'deleteCurrentWordAndWrongTextAndAddKeyToWrongText',
                target: 'validate',
              },
            ],
            DELETE_CHAR: [
              {
                actions: 'deleteCurrentWordAndClearWrongText',
                target: 'validate',
              }
            ],
            DELETE_WORD: [
              {
                actions: 'deleteCurrentWordAndClearWrongText',
                target: 'validate',
              }
            ]
          }
        },
        validate: {
          on: {
            '': [
              { cond: 'isFinished', target: '#root.finished' },
              { cond: 'isValid', target: 'valid' },
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
const machine = createMachine(machineConfig, {
  guards: {
    keyMatchesCurrentPos: ({ text, pos }, e) =>
      e.type === 'KEY_DOWN' && e.key === text[pos],
    hasAnyText: ({ text, pos, curWrongText }) =>
      pos > 0 && text[pos-1] !== ' ' || curWrongText.length > 0,
    keyMatchesStartOfCurrentWord: ({ text, pos }, e) => {
      if (e.type !== 'KEY_DOWN') return false
      const wordPos = pos === 0 || text[pos-1] === ' '
        ? pos
        : text.slice(0, pos).lastIndexOf(' ') + 1
      return text[wordPos] === e.key
    },
    isFinished: ({ text, pos }) => text?.length === pos,
    isValid: ({ curWrongText }) => curWrongText === '',
    wrongTextHasSpacesInMiddle: ({ curWrongText }) =>  / [^ ]/.test(curWrongText),
  },
  actions: {
    incPos: assign({ pos: ({ pos }) => pos + 1 }),
    addKeyToWrongText: assign({
      curWrongText: ({ curWrongText }, e) => e.type === 'KEY_DOWN'
        ? curWrongText + e.key
        : curWrongText
    }),
    deleteOneCharOfCurrentWord:
      assign({
        pos: ({ text, pos }) =>
          pos === 0 || text[pos - 1] === ' '
            ? pos
            : pos - 1
      }),
    deleteCurrentWord:
      assign({
        pos: ({ text, pos }) =>
          pos === 0 || text[pos - 1] === ' '  // prevent deleting prev word
            ? pos
            : text.slice(0, pos).lastIndexOf(' ') + 1
      }),
    deleteCurrentWordAndClearWrongText:
      assign({
        curWrongText: (_) => '',
        pos: ({ text, pos }) =>
          pos === 0 || text[pos-1] === ' '
            ? pos
            : text.slice(0, pos).lastIndexOf(' ') + 1,
      }),
    deleteOneWrongChar:
      assign({
        curWrongText: ({ curWrongText }) => curWrongText.slice(0, -1),
      }),
    deleteCurrentWordAndWrongTextAndIncPos:
      assign({
        curWrongText: (_) => '',
        pos: ({ text, pos }) =>
          pos === 0 || text[pos-1] === ' '
            ? pos + 1
            : text.slice(0, pos).lastIndexOf(' ') + 2
      }),
    deleteCurrentWordAndWrongTextAndAddKeyToWrongText:
      assign({
        curWrongText: ({ curWrongText }, e) =>
          e.type === 'KEY_DOWN'
            ? curWrongText + e.key
            : curWrongText,
        pos: ({ text, pos }) =>
          pos === 0 || text[pos-1] === ' '
            ? pos
            : text.slice(0, pos).lastIndexOf(' ') + 1,
      }),
    deleteLastWordFromWrongText:
      assign({
        curWrongText: ({ curWrongText }) =>
          curWrongText.slice(
            0, Math.max(curWrongText.replace(/[ ]+$/, '').lastIndexOf(' '), 0))
      })
  }
})
export default machine
