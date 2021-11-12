export const getTimeInSeconds = (duration: number, start: number) =>
  Math.round((duration - (Date.now() - start)) / 1000)
