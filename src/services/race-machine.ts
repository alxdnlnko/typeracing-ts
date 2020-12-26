import {
  createMachine,
  assign,
  MachineConfig,
  State,
  Interpreter,
} from 'xstate'
import { Decimal } from 'decimal.js'


const COUNTDOWN_READY_THRES: number = 2


interface TRaceContext {
  text: string|null
  pos: number
  wrongText: string
  raceStartTime: number
  speed: string
  errorsCount: number
  lastErrorPos: number
  countdown: number
}

interface TRaceStateSchema {
  states: {
    init: {}
    countdown: {
      states: {
        waiting: {}
        ready: {}
      }
    }
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
  | { type: 'INIT', text: string, countdown?: number }
  | { type: 'KEY_DOWN', key: string }
  | { type: 'DELETE_CHAR' }
  | { type: 'DELETE_WORD' }
  | { type: 'SELECT_ALL' }
  | { type: 'TIMER' }

type TRaceMachineConfig = MachineConfig<TRaceContext, TRaceStateSchema, TRaceEvent>
export type TRaceState = State<TRaceStateSchema, TRaceEvent>
export type TRaceService = Interpreter<TRaceContext, TRaceStateSchema, TRaceEvent>

const machineConfig: TRaceMachineConfig = {
  initial: 'init',
  key: 'root',
  context: {
    text: null,
    pos: 0,
    wrongText: '',
    raceStartTime: -1,
    speed: '',
    errorsCount: 0,
    lastErrorPos: -1,
    countdown: 10,
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
            wrongText: (_) => '',
            raceStartTime: (_) => -1,
            speed: (_) => '',
            errorsCount: (_) => 0,
            lastErrorPos: (_) => -1,
            countdown: (_, { countdown }) => countdown || 10,
          }),
        }
      }
    },
    countdown: {
      initial: 'waiting',
      states: {
        waiting: {
          on: {
            TIMER: [
              {
                cond: 'isCountdownReady',
                actions: 'decCountdown',
                target: 'ready',
              },
              {
                actions: 'decCountdown',
              },
            ]
          }
        },
        ready: {
          on: {
            TIMER: [
              {
                cond: 'isCountdownOver',
                target: '#root.race',
              },
              {
                actions: 'decCountdown',
              }
            ]
          }
        },
      },
      invoke: {
        id: 'timer',
        src: () => (cb) => {
          const id = setInterval(() => cb({ type: 'TIMER' }), 1000)
          return () => clearInterval(id)
        },
      }
    },
    race: {
      initial: 'valid',
      entry: 'setRaceStartTime',
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
                actions: [ 'incPos', 'updateSpeed', 'resetErrorPos' ],
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
          entry: 'updateErrors',
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
    hasAnyText: ({ text, pos, wrongText }) =>
      pos > 0 && text[pos-1] !== ' ' || wrongText.length > 0,
    keyMatchesStartOfCurrentWord: ({ text, pos }, e) => {
      if (e.type !== 'KEY_DOWN') return false
      const wordPos = pos === 0 || text[pos-1] === ' '
        ? pos
        : text.slice(0, pos).lastIndexOf(' ') + 1
      return text[wordPos] === e.key
    },
    isFinished: ({ text, pos }) => text?.length === pos,
    isValid: ({ wrongText }) => wrongText === '',
    wrongTextHasSpacesInMiddle: ({ wrongText }) =>  / [^ ]/.test(wrongText),
    isCountdownReady: ({ countdown }) => countdown <= COUNTDOWN_READY_THRES + 1,
    isCountdownOver: ({ countdown }) => countdown <= 0 + 1,
  },
  actions: {
    incPos: assign({ pos: ({ pos }) => pos + 1 }),
    addKeyToWrongText: assign({
      wrongText: ({ wrongText }, e) => e.type === 'KEY_DOWN'
        ? wrongText + e.key
        : wrongText
    }),
    deleteOneCharOfCurrentWord: assign({
      pos: ({ text, pos }) =>
        pos === 0 || text[pos - 1] === ' '
          ? pos
          : pos - 1
    }),
    deleteCurrentWord: assign({
      pos: ({ text, pos }) =>
        pos === 0 || text[pos - 1] === ' '  // prevent deleting prev word
          ? pos
          : text.slice(0, pos).lastIndexOf(' ') + 1
    }),
    deleteCurrentWordAndClearWrongText: assign({
      wrongText: (_) => '',
      pos: ({ text, pos }) =>
        pos === 0 || text[pos-1] === ' '
          ? pos
          : text.slice(0, pos).lastIndexOf(' ') + 1,
    }),
    deleteOneWrongChar: assign({
      wrongText: ({ wrongText }) => wrongText.slice(0, -1),
    }),
    deleteCurrentWordAndWrongTextAndIncPos: assign({
      wrongText: (_) => '',
      pos: ({ text, pos }) =>
        pos === 0 || text[pos-1] === ' '
          ? pos + 1
          : text.slice(0, pos).lastIndexOf(' ') + 2
    }),
    deleteCurrentWordAndWrongTextAndAddKeyToWrongText: assign({
      wrongText: ({ wrongText }, e) =>
        e.type === 'KEY_DOWN'
          ? wrongText + e.key
          : wrongText,
      pos: ({ text, pos }) =>
        pos === 0 || text[pos-1] === ' '
          ? pos
          : text.slice(0, pos).lastIndexOf(' ') + 1,
    }),
    deleteLastWordFromWrongText: assign({
      wrongText: ({ wrongText }) =>
        wrongText.slice(
          0, Math.max(wrongText.replace(/[ ]+$/, '').lastIndexOf(' '), 0))
    }),
    setRaceStartTime: assign({
      raceStartTime: (_) => +new Date(),
    }),
    updateSpeed: assign({
      speed: ({ pos, raceStartTime, speed }, e) => {
        if (e.type !== 'KEY_DOWN') return speed
        const dPos = new Decimal(pos)
        const dMinutes = new Decimal(+new Date() - raceStartTime).dividedBy(60000)
        const res = dPos.dividedBy(dMinutes).toFixed(2)
        return res
      },
    }),
    updateErrors: assign({
      lastErrorPos: ({ pos }) => pos,
      errorsCount: ({ lastErrorPos, errorsCount, pos }) => pos !== lastErrorPos ? errorsCount + 1 : errorsCount,
    }),
    resetErrorPos: assign({
      lastErrorPos: (_) => -1,
    }),
    decCountdown: assign({
      countdown: ({ countdown }) => countdown - 1,
    }),
  }
})
export default machine
