const sampleTimes = [
  [100, 5, 200],
  [100, 0, 20],
  [91, 100, 90],
]

const startPoint = [0, 0]
const endPoint = [2, 2]

const building = sampleTimes.reverse()

const getNodeIdForAnyBuilding = N => (floorId, roomId) => floorId * (N + 1) +
roomId
const getNodeId = getNodeIdForAnyBuilding(building.length - 1)

const createGraph = building => {
  const N = building.length - 1
  const M = building[0].length - 1

  const getNeighborsIds = (floorId, roomId) => {

    const roomLeft = {
      floorId,
      roomId: roomId - 1,
    }
    const roomRight = {
      floorId,
      roomId: roomId + 1,
    }
    const roomUp = {
      floorId: floorId + 1,
      roomId: roomId,
    }
    const roomDown = {
      floorId: floorId - 1,
      roomId: roomId,
    }

    const neighbors = [roomLeft, roomRight, roomUp, roomDown]

    return neighbors.filter(
      ({floorId, roomId}) => floorId >= 0 && floorId <= N &&
      roomId >= 0 && roomId <= M).filter(({floorId, roomId}) => {
      return building[floorId][roomId] > 0
    }).map(({floorId, roomId}) => getNodeId(floorId, roomId))

  }

  return building.reduce(
    ({nodeList, neighborsHash}, currFloor, floorId) => {

      const {floorNodeList, floorNeighbors} = currFloor.reduce(
        ({floorNodeList, floorNeighbors}, roomTime, roomId) => {

          if (building[floorId][roomId] === 0) {
            return {floorNodeList, floorNeighbors}
          }

          const nodeId = getNodeId(floorId, roomId)
          const node = {
            nodeId,
            floorId,
            roomId,
            roomTime,
          }
          const neighbors = getNeighborsIds(floorId, roomId)

          return {
            floorNodeList: {
              ...floorNodeList,
              ...{[nodeId]: node}
            },
            floorNeighbors: {
              ...floorNeighbors,
              ...{[nodeId]: neighbors},

            },
          }

        },
        {floorNodeList: {}, floorNeighbors: {}})

      return {
        nodeList: {...nodeList, ...floorNodeList},
        neighborsHash: {...neighborsHash, ...floorNeighbors},
      }

    }, {nodeList: [], neighborsHash: {}})

}

const findSolution = (startPoint, endPoint, {nodeList, neighborsHash}) => {
  const startNodeId = getNodeId(...startPoint)
  const endNodeId = getNodeId(...endPoint)
  const startNode = {
    ...nodeList[startNodeId],
    parentNodeId: null,
    pathCost: 0,
  }
  const endNode = nodeList[endNodeId]

  let problemSolved = false
  let frontier = [startNode]
  let exploredNodes = []

  while (!problemSolved) {
    const currentNode = frontier.sort(
      ({pathCost: pathCostA}, {pathCost: pathCostB}) => pathCostA -
      pathCostB)[0]
    const {nodeId, pathCost} = currentNode

    if (nodeId === endNodeId) {
      console.log('solved')
      problemSolved = true
      exploredNodes = [
        ...exploredNodes,
        currentNode,
      ]
      break

    }

    const exploredNodesIds = exploredNodes.map(({nodeId}) => nodeId)
    const newNodesIds = neighborsHash[nodeId].filter(
      newNodeId => !exploredNodesIds.includes(newNodeId))

    const newNodes = newNodesIds.map(newNodeId => {
      const newNode = nodeList[newNodeId]
      return {
        ...newNode,
        parentNodeId: nodeId,
        pathCost: pathCost + newNode.roomTime,
      }
    })

    frontier = [
      ...frontier.filter(
        node => node.nodeId !== nodeId && !exploredNodesIds.includes(nodeId)),
      ...newNodes]
    exploredNodes = [...exploredNodes, currentNode]

  }

  const backtraceRoute = exploredNodes => {
    const lastNode = exploredNodes[exploredNodes.length - 1]
    const steps = [lastNode.nodeId, lastNode.parentNodeId]
    let currentParentId = lastNode.parentNodeId
    let routeFound = false

    while (!routeFound) {
      const {parentNodeId} = exploredNodes.find(
        ({nodeId}) => nodeId === currentParentId)
      if (parentNodeId === null) {
        routeFound = true
        break
      }
      steps.push(parentNodeId)
      currentParentId = parentNodeId
    }

    return steps.reverse()
  }

  return {
    route: backtraceRoute(exploredNodes),
    totalTime: exploredNodes[exploredNodes.length - 1].pathCost,
  }

}

const {route, totalTime} = findSolution(startPoint, endPoint, createGraph(building))

console.log(route)
console.log(totalTime)

// visualization
//
// const $canvas = document.querySelector('#canvas')
// console.log($canvas)
//
// const ctx = $canvas.getContext('2d')
//
// const room = {width: 30, height: 50}
//
// //
// // building.forEach(floor => {
// //   floor.forEach(room => {})
// // })
//
// console.table(nodeList)
