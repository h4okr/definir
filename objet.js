import desc from "./descripteur.js";
import fusion from "./fusion.js";
import Glossaire from "./glossaire.js";

const obj = function (prototype, propriétés) {
  return Object.create(prototype, propriétés);
};
function constructeur(fabrique) {
  return {
    constructor: desc.direct(fabrique, true, false, true),
  };
}
function hérite(fabrique, superConstructeur, comportement) {
  const compléments = comportement
    ? fusion(constructeur(fabrique), comportement)
    : constructeur(fabrique);
  fabrique.prototype = obj(superConstructeur, compléments);
}

obj.fusion = fusion;
obj.constructeur = constructeur;
obj.propriétés = Object.keys;
obj.entrées = Object.entries;
obj.glossaire = function glossaire(objet) {
  return new Glossaire(...obj.entrées(objet));
};
obj.hérite = hérite;

export default obj;
