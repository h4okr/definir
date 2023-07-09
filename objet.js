const desc = require("./descripteur.js");

const obj = function(prototype, propriétés) {
  return Object.create(prototype, propriétés);
}
function constructeur(fabrique) {
  return {
    constructor: desc.direct(fabrique, true, false, true)
  }
}
function fusion(cible, ...compléments) {
  return Object.assign(cible, ...compléments);
}

obj.fusion = fusion;
obj.constructeur = constructeur;
obj.propriétés = Object.keys;
obj.entrées = Object.entries;
obj.glossaire = function glossaire(objet) {
  return new Map(obj.entrées(objet));
};
obj.

module.exports = obj;