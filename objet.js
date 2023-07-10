const desc = require("./descripteur.js");
const fusion = require("./fusion.js");

const obj = function(prototype, propriétés) {
  return Object.create(prototype, propriétés);
}
function constructeur(fabrique) {
  return {
    constructor: desc.direct(fabrique, true, false, true)
  }
}
function hérite(fabrique, superconstructeur, comportement) {
  const compléments = comportement ? fusion(constructeur(fabrique), comportement) : constructeur(fabrique);
  fabrique.prototype = obj(superconstructeur, compléments);
}

obj.fusion = fusion;
obj.constructeur = constructeur;
obj.propriétés = Object.keys;
obj.entrées = Object.entries;
obj.glossaire = function glossaire(objet) {
  return new Map(obj.entrées(objet));
};
obj.hérite = hérite;

module.exports = obj;