import React from "react"

export default () => {
  return (
    <div className="flex justify-between p-1">
      <div className="bg-red-500 p-1 m-1 text-white text-xs flex flex-col text-center items-center">
        <img className="h-10 max-w-none" src={`/0-bottle.png`} />
        Don't Click!
      </div>
      <div className="bg-green-500 p-1 m-1 text-white text-xs flex flex-col text-center items-center">
        <img className="h-10 max-w-none " src={`/1-bottle.png`} />
        Click Me!
      </div>
    </div>
  )
}
