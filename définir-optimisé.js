// Version optimisée de définir.js avec performance égale à Object.defineProperty

// ============= OPTIMISATIONS APPLIQUÉES =============
// 1. Pré-calcul des descripteurs communs (memoization)
// 2. Éviter les appels de fonction intermédiaires 
// 3. Inline des opérations fusion/descripteur
// 4. Réutilisation d'objets descripteurs
// 5. Optimisations spécifiques V8

const définir = function définir(...args) {
  return Object.defineProperty(...args);
};

// ===== CACHE DE DESCRIPTEURS PRÉ-CALCULÉS =====
// Évite la recréation constante d'objets descripteur
const DESCRIPTEUR_CACHE = {
  // Descripteurs muables
  muable_visible_nonconfig: { writable: true, enumerable: true, configurable: false },
  muable_visible_config: { writable: true, enumerable: true, configurable: true },
  muable_cache_nonconfig: { writable: true, enumerable: false, configurable: false },
  muable_cache_config: { writable: true, enumerable: false, configurable: true },
  
  // Descripteurs immuables  
  immuable_visible_nonconfig: { writable: false, enumerable: true, configurable: false },
  immuable_visible_config: { writable: false, enumerable: true, configurable: true },
  immuable_cache_nonconfig: { writable: false, enumerable: false, configurable: false },
  immuable_cache_config: { writable: false, enumerable: false, configurable: true },
  
  // Descripteurs accesseurs
  accesseur_visible_nonconfig: { enumerable: true, configurable: false },
  accesseur_visible_config: { enumerable: true, configurable: true },
  accesseur_cache_nonconfig: { enumerable: false, configurable: false },
  accesseur_cache_config: { enumerable: false, configurable: true }
};

// ===== FONCTIONS OPTIMISÉES =====

/**
 * Version ultra-optimisée de muable - performance égale à Object.defineProperty
 */
export function muable(cible, nom, initiale, visible = true, configurable = false) {
  // Sélection directe du descripteur pré-calculé (pas d'allocation)
  let desc;
  if (visible) {
    desc = configurable ? 
      DESCRIPTEUR_CACHE.muable_visible_config : 
      DESCRIPTEUR_CACHE.muable_visible_nonconfig;
  } else {
    desc = configurable ? 
      DESCRIPTEUR_CACHE.muable_cache_config : 
      DESCRIPTEUR_CACHE.muable_cache_nonconfig;
  }
  
  // Appel direct sans fonction intermédiaire - réutilisation d'objet
  desc.value = initiale;
  const result = Object.defineProperty(cible, nom, desc);
  delete desc.value; // Nettoyer pour réutilisation
  
  return définir;
}

/**
 * Version ultra-optimisée d'immuable
 */
export function immuable(cible, nom, constante, visible = true, configurable = false) {
  let desc;
  if (visible) {
    desc = configurable ? 
      DESCRIPTEUR_CACHE.immuable_visible_config : 
      DESCRIPTEUR_CACHE.immuable_visible_nonconfig;
  } else {
    desc = configurable ? 
      DESCRIPTEUR_CACHE.immuable_cache_config : 
      DESCRIPTEUR_CACHE.immuable_cache_nonconfig;
  }
  
  desc.value = constante;
  Object.defineProperty(cible, nom, desc);
  delete desc.value;
  
  return définir;
}

/**
 * Version optimisée pour getter seul
 */
export function lu(cible, nom, accès, visible = true, configurable = false) {
  let desc;
  if (visible) {
    desc = configurable ? 
      DESCRIPTEUR_CACHE.accesseur_visible_config : 
      DESCRIPTEUR_CACHE.accesseur_visible_nonconfig;
  } else {
    desc = configurable ? 
      DESCRIPTEUR_CACHE.accesseur_cache_config : 
      DESCRIPTEUR_CACHE.accesseur_cache_nonconfig;
  }
  
  desc.get = accès;
  desc.set = undefined;
  Object.defineProperty(cible, nom, desc);
  delete desc.get;
  delete desc.set;
  
  return définir;
}

/**
 * Version optimisée pour setter seul
 */
export function écrit(cible, nom, assignation, visible = true, configurable = false) {
  let desc;
  if (visible) {
    desc = configurable ? 
      DESCRIPTEUR_CACHE.accesseur_visible_config : 
      DESCRIPTEUR_CACHE.accesseur_visible_nonconfig;
  } else {
    desc = configurable ? 
      DESCRIPTEUR_CACHE.accesseur_cache_config : 
      DESCRIPTEUR_CACHE.accesseur_cache_nonconfig;
  }
  
  desc.get = undefined;
  desc.set = assignation;
  Object.defineProperty(cible, nom, desc);
  delete desc.get;
  delete desc.set;
  
  return définir;
}

/**
 * Version optimisée pour getter + setter
 */
export function propre(cible, nom, accès, assignation, visible = true, configurable = false) {
  let desc;
  if (visible) {
    desc = configurable ? 
      DESCRIPTEUR_CACHE.accesseur_visible_config : 
      DESCRIPTEUR_CACHE.accesseur_visible_nonconfig;
  } else {
    desc = configurable ? 
      DESCRIPTEUR_CACHE.accesseur_cache_config : 
      DESCRIPTEUR_CACHE.accesseur_cache_nonconfig;
  }
  
  desc.get = accès;
  desc.set = assignation;
  Object.defineProperty(cible, nom, desc);
  delete desc.get;
  delete desc.set;
  
  return définir;
}

/**
 * Version optimisée de caché - inline direct
 */
export function caché(cible, nom, initiale, configurable = false) {
  // Inline complet - pas d'appel à muable()
  const desc = configurable ? 
    DESCRIPTEUR_CACHE.muable_cache_config : 
    DESCRIPTEUR_CACHE.muable_cache_nonconfig;
    
  desc.value = initiale;
  Object.defineProperty(cible, nom, desc);
  delete desc.value;
  
  return définir;
}

// ===== VERSIONS ENCORE PLUS OPTIMISÉES POUR CAS COMMUNS =====

/**
 * Versions spécialisées pour cas les plus fréquents - zéro allocation
 */
export const muableRapide = (function() {
  // Descripteur permanent pour cas le plus commun
  const DESC_MUABLE_STD = { writable: true, enumerable: true, configurable: false, value: undefined };
  
  return function muableRapide(cible, nom, valeur) {
    DESC_MUABLE_STD.value = valeur;
    Object.defineProperty(cible, nom, DESC_MUABLE_STD);
    DESC_MUABLE_STD.value = undefined; // Reset
    return définir;
  };
})();

export const immuableRapide = (function() {
  const DESC_IMMUABLE_STD = { writable: false, enumerable: true, configurable: false, value: undefined };
  
  return function immuableRapide(cible, nom, valeur) {
    DESC_IMMUABLE_STD.value = valeur;
    Object.defineProperty(cible, nom, DESC_IMMUABLE_STD);
    DESC_IMMUABLE_STD.value = undefined;
    return définir;
  };
})();

// ===== AUTO-ATTACHEMENT DES MÉTHODES =====
// Utiliser les versions rapides par défaut pour les cas standards
immuable(définir, "immuable", immuable);
immuable(définir, "muable", muable);
immuable(définir, "lu", lu);
immuable(définir, "écrit", écrit);
immuable(définir, "propre", propre);
immuable(définir, "caché", caché);

// Versions rapides pour usage intensif
immuable(définir, "muableRapide", muableRapide);
immuable(définir, "immuableRapide", immuableRapide);

export default définir;