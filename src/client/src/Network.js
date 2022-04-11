import io from 'socket.io-client';

class Network {
  init(serverUrl, userName, color, updateSelfId, handleStateUpdate) {
    this.socket = io(serverUrl, {
      transports: ['websocket'],
      query: {
        userName,
        token: '1234qwer',
      }
    });

    this.socket.on('connect', () => {
      // Get scoketID from the connected socket and store it
      updateSelfId(this.socket.id);

      // receive state updates from the server
      this.socket.on('stateUpdate', handleStateUpdate);

      // tell server to initialize the player
      this.socket.emit('initialize', { userName, color });
    });
  }
  sendPosition(positionData) {
    this.socket.emit('positionUpdate', positionData);
  }
}

const network = new Network();

export default network;
