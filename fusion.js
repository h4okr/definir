module.exports = function fusion(cible, ...compléments) {
  return Object.assign(cible, ...compléments);
};