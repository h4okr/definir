import { describe, test, expect } from '@jest/globals';

// Import versions originales et optimisées
import descripteurOriginal from './../descripteur-original.js';
import descripteurOptimisé from './../descripteur.js';

describe('Benchmarks descripteur.js - Comparaison performances', () => {
  
  const ITERATIONS = 100000;
  const obj = {};
  
  // Fonction utilitaire pour mesurer le temps d'exécution
  function mesurer(nom, fn, iterations = ITERATIONS) {
    // Warm-up pour optimisations JIT
    for (let i = 0; i < 1000; i++) fn();
    
    const début = performance.now();
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    const fin = performance.now();
    const temps = fin - début;
    
    console.log(`${nom}: ${temps.toFixed(2)}ms pour ${iterations} itérations`);
    return temps;
  }

  test('Performance direct() - version originale vs optimisée', () => {
    let résultat;
    
    // Test version originale
    const tempsOriginal = mesurer('direct() original', () => {
      résultat = descripteurOriginal.direct('test', true, true, false);
    });
    
    // Test version optimisée  
    const tempsOptimisé = mesurer('direct() optimisé', () => {
      résultat = descripteurOptimisé.direct('test', true, true, false);
    });
    
    // Test version ultra-rapide
    const tempsUltraRapide = mesurer('directRapide() ultra', () => {
      résultat = descripteurOptimisé.directRapide('test', true, true);
    });
    
    // Calcul des améliorations
    const améliorationOptimisé = ((tempsOriginal - tempsOptimisé) / tempsOriginal * 100);
    const améliorationUltraRapide = ((tempsOriginal - tempsUltraRapide) / tempsOriginal * 100);
    
    console.log(`\nAmélioration direct() optimisé: +${améliorationOptimisé.toFixed(1)}%`);
    console.log(`Amélioration directRapide(): +${améliorationUltraRapide.toFixed(1)}%`);
    
    // Validation que l'optimisation est plus rapide
    expect(tempsOptimisé).toBeLessThan(tempsOriginal);
    expect(tempsUltraRapide).toBeLessThan(tempsOptimisé);
    
    // Validation que les résultats sont équivalents
    const original = descripteurOriginal.direct('test', true, true, false);
    const optimisé = descripteurOptimisé.direct('test', true, true, false);
    const ultraRapide = descripteurOptimisé.directRapide('test', true, true);
    
    expect(optimisé).toEqual(original);
    expect(ultraRapide).toEqual(original);
  });

  test('Performance indirect() - version originale vs optimisée', () => {
    const getter = () => 'valeur';
    const setter = (v) => {};
    let résultat;
    
    // Test version originale
    const tempsOriginal = mesurer('indirect() original', () => {
      résultat = descripteurOriginal.indirect(getter, setter, true, false);
    });
    
    // Test version optimisée
    const tempsOptimisé = mesurer('indirect() optimisé', () => {
      résultat = descripteurOptimisé.indirect(getter, setter, true, false);
    });
    
    // Test version ultra-rapide
    const tempsUltraRapide = mesurer('indirectRapide() ultra', () => {
      résultat = descripteurOptimisé.indirectRapide(getter, setter, true);
    });
    
    // Calcul des améliorations
    const améliorationOptimisé = ((tempsOriginal - tempsOptimisé) / tempsOriginal * 100);
    const améliorationUltraRapide = ((tempsOriginal - tempsUltraRapide) / tempsOriginal * 100);
    
    console.log(`\nAmélioration indirect() optimisé: +${améliorationOptimisé.toFixed(1)}%`);
    console.log(`Amélioration indirectRapide(): +${améliorationUltraRapide.toFixed(1)}%`);
    
    // Validation que l'optimisation est plus rapide
    expect(tempsOptimisé).toBeLessThan(tempsOriginal);
    expect(tempsUltraRapide).toBeLessThan(tempsOptimisé);
    
    // Validation que les résultats sont équivalents
    const original = descripteurOriginal.indirect(getter, setter, true, false);
    const optimisé = descripteurOptimisé.indirect(getter, setter, true, false);
    const ultraRapide = descripteurOptimisé.indirectRapide(getter, setter, true);
    
    expect(optimisé).toEqual(original);
    expect(ultraRapide).toEqual(original);
  });

  test('Performance cas avec configurable=true (doit utiliser version complète)', () => {
    let résultat;
    
    // Test avec configurable=true - doit utiliser version complète
    const tempsOriginal = mesurer('direct() configurable=true original', () => {
      résultat = descripteurOriginal.direct('test', true, true, true);
    }, 50000);
    
    const tempsOptimisé = mesurer('direct() configurable=true optimisé', () => {
      résultat = descripteurOptimisé.direct('test', true, true, true);
    }, 50000);
    
    // Même avec configurable=true, la version optimisée devrait être plus rapide
    // car elle évite les appels à fusion()
    const amélioration = ((tempsOriginal - tempsOptimisé) / tempsOriginal * 100);
    console.log(`\nAmélioration avec configurable=true: +${amélioration.toFixed(1)}%`);
    
    expect(tempsOptimisé).toBeLessThan(tempsOriginal);
    
    // Validation résultats équivalents
    const original = descripteurOriginal.direct('test', true, true, true);
    const optimisé = descripteurOptimisé.direct('test', true, true, true);
    expect(optimisé).toEqual(original);
  });

  test('Validation compatibilité API complète', () => {
    // Test toutes les combinaisons de paramètres
    const combinaisons = [
      [true, true, false],   // muable, visible, configurable=false
      [false, true, false],  // immuable, visible, configurable=false  
      [true, false, false],  // muable, invisible, configurable=false
      [false, false, false], // immuable, invisible, configurable=false
      [true, true, true],    // muable, visible, configurable=true
      [false, false, true]   // immuable, invisible, configurable=true
    ];
    
    combinaisons.forEach(([muable, visible, configurable]) => {
      const original = descripteurOriginal.direct('test', muable, visible, configurable);
      const optimisé = descripteurOptimisé.direct('test', muable, visible, configurable);
      
      expect(optimisé).toEqual(original);
    });
    
    // Test indirect avec différentes combinaisons
    const getter = () => 'valeur';
    const setter = (v) => {};
    
    [[true, false], [false, false], [true, true], [false, true]].forEach(([visible, configurable]) => {
      const original = descripteurOriginal.indirect(getter, setter, visible, configurable);
      const optimisé = descripteurOptimisé.indirect(getter, setter, visible, configurable);
      
      expect(optimisé).toEqual(original);
    });
  });
});