const sampleTimes = [
  [100, 210, 200],
  [300, 0, 40],
  [91, 50, 20],
]

const getNodeIdForAnyBuilding = N => (floorId, roomId) => floorId * N + roomId
const getNodeId = getNodeIdForAnyBuilding(sampleTimes.length - 1)

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
            floorNodeList: [...floorNodeList, node],
            floorNeighbors: {
              ...floorNeighbors,
              ...{[nodeId]: neighbors},

            },
          }

        },
        {floorNodeList: [], floorNeighbors: {}})

      return {
        nodeList: [...nodeList, ...floorNodeList],
        neighborsHash: {...neighborsHash, ...floorNeighbors},
      }

    }, {nodeList: [], neighborsHash: {}})

}

const {nodeList, neighborsHash} = createGraph(sampleTimes)

const startPoint = [0, 1]
const endPoint = [2, 1]

const startNodeId = getNodeId(...startPoint)
const endNodeId = getNodeId(...endPoint)

let problemSolved = false
const startNode = {
  ...nodeList[startNodeId],
  parentNodeId: null,
  pathCost: 0,
}
let frontier = [startNode]
let exploredNodesIds = [startNodeId]

while (!problemSolved) {
  // debugger
  const {nodeId, pathCost} = frontier.sort(
    ({pathCost: pathCostA}, {pathCost: pathCostB}) => pathCostA - pathCostB)[0]
  const newNodesIds = neighborsHash[nodeId].filter(
    newNodeId => !exploredNodesIds.includes(newNodeId))

  if (newNodesIds.includes(endNodeId)) {
      problemSolved = true
      console.log('solved')
  }

  const newNodes = newNodesIds.map(newNodeId => {
    const newNode = nodeList[newNodeId]

    return {
      ...newNode,
      parentNodeId: nodeId,
      pathCost: pathCost + newNode.roomTime,
    }
  })

  frontier = [...frontier.filter(node => node.nodeId !== nodeId), ...newNodes]
  exploredNodesIds = [...exploredNodesIds, ...newNodesIds]

}