import { useRef, useEffect, useState, useCallback } from 'react'
import { useSpring, animated } from 'react-spring'
import { useDrag } from '@use-gesture/react'

function App() {
  const [timer, setTimer] = useState(0)
  const [hero, setHero] = useState({
    width: 40,
    height: 60,
    x: 375 / 2 - 20,
    y: 150,
    speedX: 0,
    speedY: 3,
  })

  const [floors, setFloors] = useState([])

  const [moving, setMoving] = useState(false)
  const [movingDirection, setMovingDirection] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
  })

  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))

  // Set the drag hook and define component movement based on gesture data.
  const bind = useDrag(({ down, movement: [mx, my] }) => {
    setMoving(down)

    // console.log(mx, my)
    setMovingDirection({
      up: my < -20,
      down: my > 20,
      left: mx < -20,
      right: mx > 20,
    })

    let newX = mx
    let newY = my

    if (Math.abs(newX) > 50) {
      newX = 50 * (newX > 0 ? 1 : -1)
    }
    if (Math.abs(newY) > 50) {
      newY = 50 * (newY > 0 ? 1 : -1)
    }

    // down is reset to 0, when not dragging
    api.start({
      x: down ? newX : 0,
      y: down ? newY : 0
    })
  })

  // looping...
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setTimer(timer + 1)

      const newFloors = [
        ...floors.map((floor) => ({
          ...floor,
          y: floor.y + floor.speedY,
        })),

        // each 800ms push a random floors
        (timer % (60 * (800 / 1000)) === 0) && {
          id: timer,
          width: 100,
          height: 10,
          x: Math.floor(Math.random() * 375),
          y: 667,
          speedX: 0,
          speedY: -3,
        },
      ].filter(Boolean).filter(floor => floor.y > 0)

      setFloors(newFloors)

      if (moving) {
        if (movingDirection.left) {
          hero.speedX = -5
        }
        if (movingDirection.right) {
          hero.speedX = 5
        }
        hero.x += hero.speedX
      }

      hero.speedY = 3
      newFloors.forEach(floor => {
        if (checkCollision(hero, floor)) {
          console.log('hit')
          hero.speedY = floor.speedY
        }
      })

      hero.y += hero.speedY
      setHero(hero)
    }, 1000 / 60);

    return () => clearInterval(timeInterval)
  }, [timer])

  function checkCollision(a, b) {
    if (a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.height + a.y > b.y) {
      // collision detected!
      console.log('hit')
      return true
    }
    return false
  }

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden" style={{ touchAction: 'none' }}>
      <div
        className="relative flex items-center justify-center border"
        style={{
          width: 375,
          height: 667,
        }}
      >
        <div className="opacity-25 absolute flex flex-col w-full h-2/3 top-0 left-0 border flex items-center justify-center">
          <div className="text-3xl font-bold uppercase">
            {moving ? 'Moving' : 'Not Moving'}
          </div>
          {
            moving && (
              <div className="text-5xl font-bold uppercase mt-2">
                {
                  ['up', 'down', 'left', 'right'].filter(direction => {
                    return movingDirection[direction]
                  }).join(' & ')
                }
              </div>
            )
          }
        </div>

        <div className="absolute w-full h-2/3 top-0 left-0">
          {/* {JSON.stringify(hero)} */}
          {/* {JSON.stringify(timer)} */}
          {/* {JSON.stringify(floors)} */}
          <div className="absolute bg-red-500" style={{
            top: hero.y,
            left: hero.x,
            width: hero.width,
            height: hero.height,
          }}></div>

          {
            floors.map(floor => (
              <div
                key={floor.id}
                className="absolute bg-black"
                style={{
                  top: floor.y,
                  left: floor.x,
                  width: floor.width,
                  height: floor.height,
                }}
              ></div>
            ))
          }
        </div>

        <div className="absolute w-full h-1/3 bottom-0 left-0 border flex items-center justify-center">
          <div className="border flex items-center justify-center rounded-full" style={{
            height: 200,
            width: 200,
          }}>
            <animated.div
              {...bind()}
              className="bg-gray-300 rounded-full opacity-50"
              style={{
                width: 100,
                height: 100,
                x,
                y,
                touchAction: 'none',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
