import { direct, indirect } from "./descripteur.js";
/*
const desc = require("./descripteur.js");
console.log(desc);
console.log(Object.getOwnPropertyNames(desc).join(","));
*/
const définir = function définir(...a) {
  return Object.defineProperty(...a);
};

// Fonctions de définition
/**
 *
 * @param {any} cible
 * @param {string} nom
 * @param {any} initiale
 * @param {boolean} visible la
 * @param {boolean} configurable
 * @returns définir
 */
export function muable(
  cible,
  nom,
  initiale,
  visible = true,
  configurable = false
) {
  définir(cible, nom, direct(initiale, true, visible, configurable));
  return définir;
}

/**
 *
 * @param {any} cible
 * @param {*} nom
 * @param {any} constante
 * @param {*} visible
 * @param {*} configurable
 * @returns définir
 */
export function immuable(
  cible,
  nom,
  constante,
  visible = true,
  configurable = false
) {
  définir(cible, nom, direct(constante, false, visible, configurable));
  return définir;
}

/**
 *
 * @param {*} cible
 * @param {*} nom
 * @param {*} accès
 * @param {*} visible
 * @param {*} configurable
 * @returns définir
 */
export function lu(cible, nom, accès, visible = true, configurable = false) {
  définir(cible, nom, indirect(accès, undefined, visible, configurable));
  return définir;
}

/**
 *
 * @param {*} cible
 * @param {*} nom
 * @param {*} assignation
 * @param {*} visible
 * @param {*} configurable
 * @returns définir
 */
export function écrit(
  cible,
  nom,
  assignation,
  visible = true,
  configurable = false
) {
  définir(cible, nom, indirect(undefined, assignation, visible, configurable));
  return définir;
}

/**
 *
 * @param {*} cible
 * @param {*} nom
 * @param {*} accès
 * @param {*} assignation
 * @param {*} visible
 * @param {*} configurable
 * @returns définir
 */
export function propre(
  cible,
  nom,
  accès,
  assignation,
  visible = true,
  configurable = false
) {
  définir(cible, nom, indirect(accès, assignation, visible, configurable));
  return définir;
}

export function caché(cible, nom, initiale, configurable = false) {
  return muable(cible, nom, initiale, false, configurable);
}

export default {
  muable,
  immuable,
  lu,
  écrit,
  propre,
  caché,
};
