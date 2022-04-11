// Player state of connected players, colors, and locations
const players = {};

const verifySocket = (socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    // The authentication is mocked and currently will assign the uname 
    // as userName (playerId). 
    // TODO: decode and verify the JWT token or verify Firebase Authentication token
    // verifyToken(socket.handshake.query.token)
    socket.userName = socket.handshake.query.userName
    next();
  }
};

const createPlayer = (userName, color) => ({
  userName,
  color,
  currency: 0,
  position: { x: 250, y: 250 } // all players begin in the center of the board
});

const updatePlayerGameState = async (db, player) => {
  let doc = await db.Player.findById(player._id);
  doc.position = player.position;
  doc.color = player.color;
  doc.currency = player.currency;
  await doc.save();
}

const getOrCreate = async (db, userName, color) => {
  let player = await db.Player.findOne({ userName: userName });
  if (!player) {
    player = new db.Player(createPlayer(userName, color));
    await player.save();
  }

  return player;
}

const onSocketConnected = async (socket, db, metrics) => {
  socket.on("disconnect", async () => {
    console.log(`Player (${socket.userName} - ${socket.id}) disconnected`);
    const player = players[socket.userName];
    if (player) {
      // On disconnect save the last known stat of the user
      await updatePlayerGameState(db, player);
      // Remove player from state on disconnect
      delete players[socket.userName];
    }
    metrics.playerDisconnected();
  });

  socket.on("positionUpdate", async (positionData) => {
    let player = players[socket.userName];
    if (player) {
      
      // If user is in bottom right corner inc() the currency by 1
      if (positionData.x > 450 && positionData.y > 450) {
        player.currency += 1;
      }

      player.position = positionData;
      socket.broadcast.emit("stateUpdate", players);

      await updatePlayerGameState(db, player);
    }
  });

  socket.on("initialize", async (data) => {
    var id = socket.userName;

    // Get or Create a new player object
    var newPlayer = await getOrCreate(db, id, data.color);

    // Add the newly created player to game state.
    players[id] = newPlayer;

    // On reconnect resend the players state
    socket.broadcast.emit("stateUpdate", players);
  });
}

const startGame = (io, db, metrics) => {
  io.sockets.use(verifySocket).on("connection", (socket) => {
    console.log(`Player (${socket.userName} - ${socket.id}) connected`);
    onSocketConnected(socket, db, metrics);
    metrics.playerConnected();
  });

  db.Player.watch({ fullDocument: 'updateLookup' }).on("change", async (change) => {
    const doc = change.fullDocument;
    const id = doc.userName;

    if (change.operationType === 'insert') {
      if (!(id in players)) {
        players[id] = doc;
      }
    } else if (change.operationType === 'update') {
      if (!(id in players)) {
        players[id] = doc;
      }
      players[id].position = doc.position;
      players[id].currency = doc.currency;
      metrics.playerCurrency(id, doc.currency);
    }

    io.emit("stateUpdate", players);
  });
};

module.exports = startGame