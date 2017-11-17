const sampleTimes = [
  [100, 210, 200],
  [300, 0, 40],
  [91, 50, 20],
]

const createGraph = building => {
  const N = building.length - 1
  const M = building[0].length - 1

  const getNodeIdForAnyBuilding = N => (floorId, roomId) => floorId * N + roomId
  const getNodeId = getNodeIdForAnyBuilding(N)

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

    return neighbors
    .filter(
      ({floorId, roomId}) => floorId >= 0 && floorId <= N &&
      roomId >= 0 && roomId <= M)
    .filter(({floorId, roomId}) => {
      return building[floorId][roomId] > 0})
    .map(({floorId, roomId}) => getNodeId(floorId, roomId))

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
            floorNeighbors: Object.assign({}, floorNeighbors,
              {[nodeId]: neighbors}),
          }

        },
        {floorNodeList: [], floorNeighbors: {}})

      return {
        nodeList: [...nodeList, ...floorNodeList],
        neighborsHash: Object.assign({}, neighborsHash, floorNeighbors),
      }

    }, {nodeList: [], neighborsHash: {}})

}

const graph = createGraph(sampleTimes)
console.log(graph.neighborsHash)
