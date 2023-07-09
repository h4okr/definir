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
function muable(cible, nom, initiale, visible = true, configurable = false) {
  définir(cible, nom, direct(initiale, true, visible, configurable));
  return définir;
}
function immuable(cible, nom, constante, visible = true, configurable = false) {
  définir(cible, nom, direct(constante, false, visible, configurable));
  return définir;
}
function lu(cible, nom, accès, visible = true, configurable = false) {
  définir(cible, nom, indirect(accès, undefined, visible, configurable));
  return définir;
}
function écrit(cible, nom, assignation, visible = true, configurable = false) {
  définir(cible, nom, indirect(undefined, assignation, visible, configurable));
  return définir;
}
function propre(cible, nom, accès, assignation, visible = true, configurable = false) {
  définir(cible, nom, indirect(accès, assignation, visible, configurable));
  return définir;
}

définir.muable = muable;
définir.immuable = immuable;
définir.lu = lu;
définir.écrit = écrit;
définir.propre = propre;

module.exports = définir;