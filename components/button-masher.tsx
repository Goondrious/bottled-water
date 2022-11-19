import React, { useState, useReducer, useCallback, useEffect } from "react"

import { getTimeInSeconds } from "../lib/time"

import Button from "@material-tailwind/react/Button"
import Progress from "@material-tailwind/react/Progress"
import Label from "@material-tailwind/react/Label"
import ScoreHint from "./score-hint"

enum Bottle {
  PLASTIC,
  REUSABLE,
}

type HydrationGameState = {
  gameStartTime: number
  score: number
  highscore: number | null
  newHighScore: boolean
  playing: boolean
  hydration: number
  bottle: Bottle
  lastScore?: number
  lastDrink?: Bottle
  timer?: any
  ticksSinceChange: number
  scores: any[]
  knobs: any
}

const TIME = 20000 // starting amount of time
const TICK = 50 // how often to apply a tick
const HYDRATION = 100
const DRINK_HYDRATION_RATE = 10
const DEHYDRATION_RATE = 0.1
const REUSABLE_SCORE = 10
const PLASTIC_SCORE = -10
const MINIMUM_TICKS_TO_CHANGE = 40
const CHANGE_RATE = 0.03

const BLANK_STATE: HydrationGameState = {
  knobs: {
    time: TIME,
    tickTime: TICK,
    reusableScore: REUSABLE_SCORE,
    plasticScore: PLASTIC_SCORE,
    hydration: HYDRATION,
    drinkHydrationRate: DRINK_HYDRATION_RATE,
    dehydrationRate: DEHYDRATION_RATE,
    minimumTicksToChange: MINIMUM_TICKS_TO_CHANGE,
    changeRate: CHANGE_RATE,
  },
  playing: false,
  gameStartTime: Date.now(),
  score: 0,
  highscore: null,
  newHighScore: false,
  hydration: 0,
  bottle: Bottle.REUSABLE,
  ticksSinceChange: 0,
  scores: [],
}

// based on hydration, from 0 to HYDRATION, how should REUSABLE_SCORE be modified?
const getHydrationBonus = (hydration: number): number => {
  if (hydration <= 50) {
    return 0.5
  }

  if (hydration <= 70) {
    return 0.8
  }

  if (hydration >= 90) {
    return 2.0
  }

  return 1.0
}

export default () => {
  /* TODO
    rearrange UI
    color-coding for button
    a better pattern for changing the bottle
  */
  const gameTick = useCallback(() => {
    dispatch({ type: "tick" })
  }, [])

  const [gameState, dispatch] = useReducer(
    (state: HydrationGameState, { type, payload }: { type: string; payload?: any }) => {
      if (type === "start") {
        clearInterval(state.timer)

        if (state.playing) {
          return {
            ...state,
            gameStartTime: Date.now(),
            hydration: 0,
            highscore: Math.max(state.highscore || state.score, state.score),
            newHighScore: state.highscore === null || state.highscore < state.score,
            playing: false,
            timer: false,
            scores: [],
          }
        } else {
          return {
            ...state,
            playing: true,
            score: 0,
            hydration: 0,
            newHighScore: false,
            gameStartTime: Date.now(),
            timer: setInterval(gameTick, TICK),
          }
        }
      }

      if (type === "stop") {
        clearInterval(state.timer)
        return {
          ...BLANK_STATE,
          highscore: state.highscore,
        }
      }

      if (state.playing && type === "tick") {
        if (Date.now() - state.gameStartTime > TIME) {
          clearInterval(state.timer)
          return {
            ...state,
            hydration: 0,
            highscore: Math.max(state.highscore || state.score, state.score),
            newHighScore: state.highscore === null || state.highscore < state.score,
            playing: false,
            timer: false,
            scores: [],
          }
        }

        const bottle =
          state.ticksSinceChange < state.knobs.minimumTicksToChange
            ? state.bottle
            : Math.random() >= state.knobs.changeRate
            ? Bottle.REUSABLE
            : Bottle.PLASTIC
        const scores = state.scores
          .map((o) => ({
            ...o,
            left: o.left * 1.3,
            opacity: o.opacity - 0.03,
          }))
          .filter((o) => o.opacity > 0)
        return {
          ...state,
          hydration: Math.min(Math.max(state.hydration - state.knobs.dehydrationRate, 0), state.knobs.hydration),
          bottle,
          ticksSinceChange: bottle === state.bottle ? state.ticksSinceChange + 1 : 0,
          scores,
        }
      }

      if (type === "bottle") {
        return {
          ...state,
          bottle: payload,
        }
      }

      if (type === "drink" && state.playing) {
        const thisScore =
          state.bottle === Bottle.REUSABLE
            ? state.knobs.reusableScore * getHydrationBonus(state.hydration)
            : state.knobs.plasticScore
        return {
          ...state,
          hydration: state.hydration + DRINK_HYDRATION_RATE,
          score: state.score + thisScore,
          scores: [...state.scores, { id: Date.now(), score: thisScore, bottle: state.bottle, left: 5, opacity: 1 }],
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
    },
    BLANK_STATE
  )

  const handleOnGameStart = () => {
    dispatch({ type: "start" })
  }
  const handleOnDrink = () => {
    dispatch({ type: "drink" })
  }

  const handleOnKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      handleOnDrink()
    }
  }, [])

  useEffect(() => {
    if (gameState.playing) {
      window.addEventListener("keydown", handleOnKeyPress)
    }
    return () => {
      window.removeEventListener("keydown", handleOnKeyPress)
    }
  }, [gameState.playing])

  return (
    <div className="w-full flex flex-col items-center overflow-hidden">
      <div className="m-2">
        <div className="flex pl-0 p-2">
          <div className="flex-shrink-0 mr-1">Hydration Bonus = x</div>
          <Label color={gameState.hydration <= 50 ? "red" : gameState.hydration <= 70 ? "amber" : "blue"}>
            {getHydrationBonus(gameState.hydration).toFixed(1)}
          </Label>
        </div>
        <Progress
          color={gameState.hydration <= 50 ? "red" : gameState.hydration <= 70 ? "amber" : "blue"}
          value={"" + gameState.hydration}
        />
      </div>
      <Button
        className="flex-wrap w-full md:w-1/2"
        buttonType={gameState.playing ? "filled" : "outline"}
        color={gameState.playing ? (gameState.bottle === Bottle.REUSABLE ? "green" : "red") : "gray"}
        onClick={handleOnDrink}
      >
        <img className="h-20" src={`/${gameState.bottle}-bottle.png`} />
        <div className="w-full">{gameState.bottle === Bottle.PLASTIC ? "Plastic" : "Reusable"}</div>
      </Button>
      <div className="flex">
        <div className="mr-2">Time: {gameState.playing ? getTimeInSeconds(TIME, gameState.gameStartTime) : 0}</div>
        <div>Score: {gameState.score}</div>
        <div className="relative max-w-full">
          {gameState.scores.map(({ id, score, bottle, left, opacity }) => (
            <div
              key={id}
              style={{
                left,
                opacity,
              }}
              className="absolute w-[50px]"
            >
              <Label color={bottle === Bottle.REUSABLE ? "blue" : "red"}>
                {bottle === Bottle.REUSABLE && "+"}
                {score}
              </Label>
            </div>
          ))}
        </div>
      </div>
      High Score: {gameState.highscore || "-"} {gameState.newHighScore && <Label color="green">New High Score!</Label>}
      <Button className="mt-2" onClick={handleOnGameStart}>
        {gameState.playing ? "Stop" : "Start"}
      </Button>
      <ScoreHint />
      <div className="w-full md:w-1/3">
        <div className="font-medium text-md"> Knobs</div>
        {[
          { key: "changeRate", name: "Change Rate", step: 0.01 },
          { key: "dehydrationRate", name: "Dehydration Rate", step: 0.1 },
        ].map((o) => (
          <div key={o.key} className="flex justify-between text-small font-light">
            <div>{o.name}</div>
            <input
              type="number"
              step={o.step}
              value={gameState.knobs[o.key]}
              onChange={(e) => dispatch({ type: "knob", payload: { knob: o.key, value: parseFloat(e.target.value) } })}
              key={o.key}
              className="w-[80px]"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
