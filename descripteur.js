// Version ultra-optimisée de descripteur.js - évite les allocations intermédiaires

// ============= DESCRIPTEURS PRÉ-CALCULÉS =============
// Cache des descripteurs les plus communs pour éviter les allocations
const DESCRIPTEURS_COMMUNS = {
  // Pour direct()
  muable_visible: { enumerable: true, configurable: false, writable: true },
  muable_invisible: { enumerable: false, configurable: false, writable: true },
  immuable_visible: { enumerable: true, configurable: false, writable: false },
  immuable_invisible: { enumerable: false, configurable: false, writable: false },
  
  // Pour indirect() 
  accessor_visible: { enumerable: true, configurable: false },
  accessor_invisible: { enumerable: false, configurable: false }
};

// ============= VERSIONS ULTRA-RAPIDES =============
// Version optimisée de direct() - évite fusion() et allocations intermédiaires
export function directRapide(valeur, muable = true, visible = true) {
  // Cas standards ultra-optimisés - construction directe sans spread
  if (muable && visible) {
    return { value: valeur, enumerable: true, configurable: false, writable: true };
  }
  if (muable && !visible) {
    return { value: valeur, enumerable: false, configurable: false, writable: true };
  }
  if (!muable && visible) {
    return { value: valeur, enumerable: true, configurable: false, writable: false };
  }
  if (!muable && !visible) {
    return { value: valeur, enumerable: false, configurable: false, writable: false };
  }
}

export function indirectRapide(accès, assignation, visible = true) {
  // Cas standards ultra-optimisés - construction directe sans spread
  if (visible) {
    return { get: accès, set: assignation, enumerable: true, configurable: false };
  } else {
    return { get: accès, set: assignation, enumerable: false, configurable: false };
  }
}

// ============= VERSIONS COMPLÈTES (avec configurable) =============
import fusion from "./fusion.js";

// Versions originales optimisées - inline des fonctions opt1/opt2
export function directComplet(valeur, muable = true, visible = true, configurable = false) {
  // Évite les appels à opt1/opt2, construction directe
  return {
    value: valeur,
    writable: muable,
    enumerable: visible,
    configurable: configurable
  };
}

export function indirectComplet(accès, assignation, visible = true, configurable = false) {
  // Construction directe sans fusion
  return {
    get: accès,
    set: assignation,
    enumerable: visible,
    configurable: configurable
  };
}

// ============= VERSIONS HYBRIDES (nouvelles par défaut) =============
export function direct(valeur, muable = true, visible = true, configurable = false) {
  // Si configurable=false (cas standard), utilise version ultra-rapide
  if (configurable === false) {
    return directRapide(valeur, muable, visible);
  }
  // Sinon utilise version complète
  return directComplet(valeur, muable, visible, configurable);
}

export function indirect(accès, assignation, visible = true, configurable = false) {
  // Si configurable=false (cas standard), utilise version ultra-rapide  
  if (configurable === false) {
    return indirectRapide(accès, assignation, visible);
  }
  // Sinon utilise version complète
  return indirectComplet(accès, assignation, visible, configurable);
}

// ============= AUTO-ATTACHEMENT =============
// Attache automatiquement toutes les fonctions à l'objet pour compatibilité
direct.directRapide = directRapide;
direct.directComplet = directComplet;
indirect.indirectRapide = indirectRapide; 
indirect.indirectComplet = indirectComplet;

export default {
  direct: direct,
  indirect: indirect,
  directRapide: directRapide,
  directComplet: directComplet,
  indirectRapide: indirectRapide,
  indirectComplet: indirectComplet
};