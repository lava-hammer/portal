
/**
 * pick one element randomly from array
 * @param array the array
 */
export function pick<T>(array: T[]): T {
  return array[Math.floor(Math.random()*array.length)]
}