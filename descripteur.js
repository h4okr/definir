const fusion = require("./fusion.js");

// Utilitaires spécifiques à Object.defineProperty
function opt1(visible = true, configurable = false) {
  return { enumerable: visible, configurable: configurable };
}
function opt2(muable = true, visible = true, configurable = false) {
  return fusion({ writable: muable }, opt1(configurable, visible));
}
function direct(valeur, muable = true, visible = true, configurable = false) {
  return fusion({ value: valeur }, opt2(muable, configurable, visible));
}
function indirect(accès, assignation, visible = true, configurable = false) {
  return fusion({ get: accès, set: assignation }, opt1(visible, configurable));
}

const descripteur = {
  direct: direct,
  indirect: indirect
};

module.exports = descripteur;