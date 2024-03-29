import React, { useState, useReducer, useCallback, useEffect } from "react"

import { getTimeInSeconds } from "../lib/time"

import H1 from "@material-tailwind/react/Heading6"
import Button from "@material-tailwind/react/Button"
import Label from "@material-tailwind/react/Label"
import ScoreHint from "./score-hint"

enum Bottle {
  PLASTIC,
  REUSABLE,
  FUCK_NESTLE,
}

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

const VECTORS = {
  // x,y
  [Direction.UP]: [0, -1],
  [Direction.DOWN]: [0, 1],
  [Direction.LEFT]: [-1, 0],
  [Direction.RIGHT]: [1, 0],
}

// clockwise order
// [up, right, down, left] -> (order.indexOf(dir) > (order.length - 1) ? -1 : order.indexOf(dir)) + 1
const getNextDirection = (dir: Direction): Direction => {
  if (dir === Direction.UP) return Direction.RIGHT
  if (dir === Direction.RIGHT) return Direction.DOWN
  if (dir === Direction.DOWN) return Direction.LEFT
  if (dir === Direction.LEFT) return Direction.UP
}

type GameObject = {
  id: string
  left: number
  top: number
  placementOptions: number[]
  direction: Direction
  fuckNestleSpawnTimerStart: number
  bottle: Bottle
}

type GameState = {
  playing: boolean
  gameStartTime: number
  score: number
  highscore: number | null
  newHighScore: boolean
  scores: any[]
  bottleScores: any[]
  direction: Direction
  directionTimerStart: number
  objects: { [k: string]: GameObject }
  fuckNestle: boolean
  fuckNestleTimerStart: number
  fuckNestleSpawnTimerStart: number
  timer?: any
  lastObjectAddTime?: any
  placementOptions: number[]
  knobs: any
}

const AXIS_PLACEMENTS = [12, 20, 30, 40, 50, 60, 70, 80]

const TIME = 20000
const TICK_TIME = 50
const DIRECTION_TIMER_CHANGE = 3001
const OBJECT_SPEED = 0.2
const OBJECT_ADD_TIME = 400
const REUSABLE_SCORE = 20
const PLASTIC_SCORE = -10
const FUCK_NESTLE_DURATION = 4000
const FUCK_NESTLE_SPAWN_TIME = 4000
const FUCK_NESTLE_SPEED = 0.12
const BOTTLE_THRESHOLD = 0.3

const BLANK_STATE: GameState = {
  knobs: {
    time: TIME,
    tickTime: TICK_TIME,
    directionTimerChange: DIRECTION_TIMER_CHANGE,
    objectSpeed: OBJECT_SPEED,
    objectAddTime: OBJECT_ADD_TIME,
    reusableScore: REUSABLE_SCORE,
    plasticScore: PLASTIC_SCORE,
    fuckNestleDuration: FUCK_NESTLE_DURATION,
    fuckNestleSpawnTime: FUCK_NESTLE_SPAWN_TIME,
    fuckNestleSpeed: FUCK_NESTLE_SPEED,
    bottleThreshold: BOTTLE_THRESHOLD,
  },
  playing: false,
  gameStartTime: Date.now(),
  score: 0,
  scores: [],
  bottleScores: [],
  highscore: null,
  newHighScore: false,
  fuckNestle: false,
  fuckNestleTimerStart: Date.now(),
  fuckNestleSpawnTimerStart: Date.now(),
  direction: Direction.DOWN,
  directionTimerStart: Date.now(),
  objects: {},
  lastObjectAddTime: Date.now(),
  placementOptions: AXIS_PLACEMENTS,
}

export default () => {
  /*
    TODO
    - color coding for images
    - different patterns for direction change
    - normalize speed to screen size
  */
  const gameTick = useCallback(() => {
    dispatch({ type: "tick" })
  }, [])

  const [gameState, dispatch] = useReducer((state: GameState, { type, payload }: { type: string; payload?: any }) => {
    if (state.playing && type === "tick") {
      let { directionTimerStart, direction, placementOptions, gameStartTime } = state

      if (Date.now() - gameStartTime > state.knobs.time) {
        // end game
        clearInterval(state.timer)
        return {
          ...state,
          objects: {},
          fuckNestle: false,
          scores: [],
          bottleScores: [],
          score: 0,
          timer: null,
          playing: false,
          highscore: Math.max(state.highscore || state.score, state.score),
          newHighScore: state.highscore === null || state.highscore < state.score,
        }
      }

      // direction change
      if (Date.now() - directionTimerStart >= state.knobs.directionTimerChange) {
        directionTimerStart = Date.now()
        direction = getNextDirection(direction)
        placementOptions = AXIS_PLACEMENTS
      }

      // end fuckNestle
      let { fuckNestle, fuckNestleTimerStart, fuckNestleSpawnTimerStart } = state
      if (fuckNestle && Date.now() - state.fuckNestleTimerStart > state.knobs.fuckNestleDuration) {
        fuckNestle = false
        fuckNestleTimerStart = Date.now()
        fuckNestleSpawnTimerStart = Date.now()
      }

      const scores = state.scores
        .map((o) => ({
          ...o,
          left: o.left * 1.1,
          opacity: o.opacity - 0.03,
        }))
        .filter((o) => o.opacity > 0)

      const bottleScores = state.bottleScores
        .map((o) => ({
          ...o,
          opacity: o.opacity - 0.02,
        }))
        .filter((o) => o.opacity > 0)

      let { objects, lastObjectAddTime } = state

      if (!fuckNestle) {
        // move objects
        objects = Object.entries(state.objects).reduce((agg, ele: any) => {
          const [key, value] = ele
          const { bottle, direction, top: oldTop, left: oldLeft } = value

          const vector = VECTORS[direction]
          const speed = bottle === Bottle.FUCK_NESTLE ? state.knobs.fuckNestleSpeed : state.knobs.objectSpeed
          const left = speed * vector[0] + oldLeft
          const top = speed * vector[1] + oldTop
          if (left > -20 && left < 110 && top > -20 && top < 110) {
            agg[key] = {
              ...value,
              top,
              left,
            }
          }
          return agg
        }, {})

        // add objects
        if (!state.fuckNestle && Date.now() - lastObjectAddTime > OBJECT_ADD_TIME) {
          let left, top

          // roll for starting placement
          if ([Direction.UP, Direction.DOWN].includes(state.direction)) {
            const idx = Math.floor(Math.random() * state.placementOptions.length)
            left = state.placementOptions[idx] + (Math.random() >= 0.5 ? -3 : 3)
            placementOptions = [...state.placementOptions.slice(0, idx), ...state.placementOptions.slice(idx + 1)]
            top = state.direction === Direction.UP ? 105 : -10
          } else {
            const idx = Math.floor(Math.random() * state.placementOptions.length)
            placementOptions = [...state.placementOptions.slice(0, idx), ...state.placementOptions.slice(idx + 1)]
            top = state.placementOptions[idx] + (Math.random() >= 0.5 ? -3 : 3)
            left = state.direction === Direction.LEFT ? 105 : -10
          }
          if (placementOptions.length === 0) {
            placementOptions = AXIS_PLACEMENTS
          }

          let bottle = Math.random() >= state.knobs.bottleThreshold ? Bottle.REUSABLE : Bottle.PLASTIC

          if (Date.now() - fuckNestleSpawnTimerStart > state.knobs.fuckNestleSpawnTime) {
            fuckNestleSpawnTimerStart = Date.now()
            bottle = Bottle.FUCK_NESTLE
          }

          lastObjectAddTime = Date.now()
          objects = {
            ...state.objects,
            [Date.now()]: {
              id: Date.now(),
              left,
              top,
              placementOptions,
              direction: state.direction,
              fuckNestleSpawnTimerStart,
              bottle,
            },
          }
        }
      }

      return {
        ...state,
        directionTimerStart,
        direction,
        fuckNestle,
        fuckNestleTimerStart,
        fuckNestleSpawnTimerStart,
        placementOptions,
        scores,
        bottleScores,
        objects,
        lastObjectAddTime,
      }
    }

    if (type === "removeObject") {
      const bottle = state.objects[payload].bottle
      if (bottle === Bottle.FUCK_NESTLE) {
        return {
          ...state,
          fuckNestle: true,
          fuckNestleTimerStart: Date.now(),
          objects: Object.entries(state.objects)
            .filter(([, v]) => v.bottle !== Bottle.FUCK_NESTLE)
            .reduce((agg, o) => ({ ...agg, [o[0]]: o[1] }), {}),
        }
      }

      const thisScore = bottle === Bottle.REUSABLE ? state.knobs.reusableScore : state.knobs.plasticScore
      let { score } = state
      score += thisScore
      const { left, top } = state.objects[payload]
      delete state.objects[payload]
      return {
        ...state,
        score,
        objects: state.objects,
        bottleScores: [...state.bottleScores, { opacity: 1, top, left, score: thisScore, id: Date.now() }],
      }
    }

    if (type === "start") {
      if (state.playing) {
        // stop
        clearInterval(state.timer)
        return {
          ...state,
          objects: {},
          fuckNestle: false,
          scores: [],
          bottleScores: [],
          highscore: Math.max(state.highscore || state.score, state.score),
          newHighScore: state.highscore === null || state.highscore < state.score,
          timer: null,
          playing: false,
        }
      } else {
        // start
        return {
          ...state,
          score: 0,
          newHighScore: false,
          gameStartTime: Date.now(),
          timer: setInterval(gameTick, TICK_TIME),
          directionTimerStart: Date.now(),
          placementOptions: AXIS_PLACEMENTS,
          objects: {},
          playing: true,
        }
      }
    }

    if (type === "bonus") {
      const score = state.score + state.knobs.reusableScore * 2
      return {
        ...state,
        score,
        scores: [...state.scores, { id: Date.now(), score: state.knobs.reusableScore * 2, left: -10, opacity: 1 }],
      }
    }

    if (type === "knob") {
      return {
        ...state,
        knobs: {
          ...state.knobs,
          [payload.knob]: payload.value,
        },
      }
    }
    return state
  }, BLANK_STATE)

  const handleOnGameStart = () => dispatch({ type: "start" })
  const handleOnBonusClick = () => dispatch({ type: "bonus" })
  const handleOnObjectClick = (id) => () => dispatch({ type: "removeObject", payload: id })

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-1/3">
        <div className="font-medium text-md"> Knobs</div>
        {[
          { key: "objectSpeed", name: "Object Speed", step: 0.1 },
          { key: "objectAddTime", name: "Object Add Time", step: 100 },
          { key: "directionTimerChange", name: "Direction Change Time", step: 1000 },
        ].map((o) => (
          <div key={o.key} className="flex justify-between text-small font-light">
            <div>{o.name}</div>
            <input
              type="number"
              step={o.step}
              value={gameState.knobs[o.key]}
              onChange={(e) => dispatch({ type: "knob", payload: { knob: o.key, value: e.target.value } })}
              key={o.key}
              className="w-[80px]"
            />
          </div>
        ))}
      </div>

      <div className="flex text-center p-1">
        <div className="flex justify-between items-center flex-shrink-0 p-1">
          <div className="font-medium text-md">High Score:</div>&nbsp;{gameState.highscore || "-"}
        </div>
        {gameState.newHighScore && <Label color="green">New High Score!</Label>}
      </div>
      <div className="flex">
        <div className="p-1 flex">
          <div className="font-medium text-md">Time:</div>&nbsp;
          {gameState.playing ? getTimeInSeconds(TIME, gameState.gameStartTime) : 0}
        </div>
        <div className="p-1 flex">
          <div className="font-medium text-md">Score:</div>&nbsp;{gameState.score}
        </div>
      </div>
      <Button onClick={handleOnGameStart}>{gameState.playing ? "Stop" : "Start"}</Button>
      <ScoreHint />
      <div className="w-full md:w-1/2 h-screen m-2">
        <div className="p-4 h-3/5 border rounded-xl relative overflow-hidden">
          {!gameState.playing && gameState.highscore !== null && (
            <div className="w-full h-full flex justify-center items-center">
              <H1>Game Over!</H1>
            </div>
          )}
          {gameState.fuckNestle ? (
            <div className="w-full h-full flex flex-col justify-center items-center text-center">
              <Label className="m-2" color="green">
                Chug! Chug!
              </Label>
              <Button
                color="green"
                className="w-6/12 h-3/6 flex justify-center items-center"
                onClick={handleOnBonusClick}
              >
                <img className="h-full m-0" src={`${Bottle.REUSABLE}-bottle.png`} />
              </Button>
              <Label color="blueGray">
                {getTimeInSeconds(gameState.knobs.fuckNestleDuration, gameState.fuckNestleTimerStart)}
              </Label>
              <div className="relative max-w-full">
                {gameState.scores.map(({ id, score, left, opacity }) => (
                  <div
                    key={id}
                    style={{
                      left,
                      opacity,
                    }}
                    className="absolute w-[50px]"
                  >
                    <Label color="blue">+{score}</Label>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            Object.values(gameState.objects).map((o: any) => (
              <button
                onPointerDown={handleOnObjectClick(o.id)}
                style={{
                  left: o.left + "%",
                  top: o.top + "%",
                }}
                className={`absolute flex justify-center p-4 rounded-xl ${
                  o.bottle === Bottle.PLASTIC
                    ? "hover:bg-red-500"
                    : o.bottle === Bottle.REUSABLE
                    ? "hover:bg-green-500"
                    : ""
                }`}
                key={o.id}
              >
                {o.bottle === Bottle.FUCK_NESTLE ? (
                  <div className="flex flex-col items-center border rounded-full bg-red-50 p-4 text-xl font-extrabold	text-green-700">
                    <div>F**k</div>
                    <div>Nestle!</div>
                  </div>
                ) : (
                  <img className="h-20 max-w-none" src={`/${o.bottle}-bottle.png`} />
                )}
              </button>
            ))
          )}
          {gameState.bottleScores.map(({ id, score, left, top, opacity }) => (
            <div
              key={id}
              style={{
                left: left + "%",
                top: top + "%",
                opacity,
              }}
              className="absolute w-[50px]"
            >
              <Label color={score > 0 ? "blue" : "red"}>
                {score > 0 && "+"}
                {score}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
