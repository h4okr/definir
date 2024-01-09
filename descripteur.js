import fusion from "./fusion.js";

// Utilitaires spécifiques à Object.defineProperty
function opt1(visible = true, configurable = false) {
  return { enumerable: visible, configurable: configurable };
}
function opt2(muable = true, visible = true, configurable = false) {
  return fusion({ writable: muable }, opt1(configurable, visible));
}
export function direct(valeur, muable = true, visible = true, configurable = false) {
  return fusion({ value: valeur }, opt2(muable, configurable, visible));
}
export function indirect(accès, assignation, visible = true, configurable = false) {
  return fusion({ get: accès, set: assignation }, opt1(visible, configurable));
}

export default {
  direct: direct,
  indirect: indirect
};