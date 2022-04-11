const client = require('prom-client');

const register = new client.Registry();

register.setDefaultLabels({
  app: 'server'
});

client.collectDefaultMetrics({ register });

const onlinePlayersGauge = new client.Gauge({ name: 'online_players', help: 'Metric for Online Players' });
register.registerMetric(onlinePlayersGauge);

const playerCurrencyMetrics = {};
module.exports = {
  getRegister: () => register,
  playerConnected: () => onlinePlayersGauge.inc(),
  playerDisconnected: () => onlinePlayersGauge.dec(),
  playerCurrency: (playerId, currency) => {
    if (!(playerId in playerCurrencyMetrics)) {
      // Create Gauge metric per user to track the currency
      const currencyMetric = new client.Gauge({ name: `player_currency_${playerId}`, help: 'Metric for Currency'});
      register.registerMetric(currencyMetric);
      playerCurrencyMetrics[playerId] = currencyMetric;
    }
    playerCurrencyMetrics[playerId].set(currency);
  },
}