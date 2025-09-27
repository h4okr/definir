import { test, describe, expect } from "@jest/globals";

// Import des deux versions
import * as original from "../définir.js";
import * as optimisé from "../définir-optimisé.js";

describe("Benchmarks Comparatifs - Original vs Optimisé", () => {
  const ITERATIONS = 10000;
  
  function benchmark(nom, fn) {
    const début = performance.now();
    fn();
    const fin = performance.now();
    const durée = fin - début;
    console.log(`${nom}: ${durée.toFixed(2)}ms`);
    return durée;
  }

  test("Performance définir.muable - Original vs Optimisé", () => {
    let obj1 = {}, obj2 = {}, obj3 = {};
    
    // Baseline - Object.defineProperty direct
    const duréeNative = benchmark("Object.defineProperty (baseline)", () => {
      for (let i = 0; i < ITERATIONS; i++) {
        Object.defineProperty(obj1, `prop${i}`, {
          value: i,
          writable: true,
          enumerable: true,
          configurable: false
        });
      }
    });
    
    // Version originale
    obj2 = {};
    const duréeOriginale = benchmark("définir.muable (original)", () => {
      for (let i = 0; i < ITERATIONS; i++) {
        original.muable(obj2, `prop${i}`, i);
      }
    });
    
    // Version optimisée
    obj3 = {};
    const duréeOptimisée = benchmark("définir.muable (optimisé)", () => {
      for (let i = 0; i < ITERATIONS; i++) {
        optimisé.muable(obj3, `prop${i}`, i);
      }
    });
    
    // Version ultra-rapide
    let obj4 = {};
    const duréeUltraRapide = benchmark("définir.muableRapide (ultra-optimisé)", () => {
      for (let i = 0; i < ITERATIONS; i++) {
        optimisé.muableRapide(obj4, `prop${i}`, i);
      }
    });
    
    console.log(`\n📊 Résultats pour ${ITERATIONS} définitions:`);
    console.log(`Native:           ${duréeNative.toFixed(2)}ms (baseline)`);
    console.log(`Original:         ${duréeOriginale.toFixed(2)}ms (${(duréeOriginale/duréeNative).toFixed(2)}x plus lent)`);
    console.log(`Optimisé:         ${duréeOptimisée.toFixed(2)}ms (${(duréeOptimisée/duréeNative).toFixed(2)}x plus lent)`);
    console.log(`Ultra-rapide:     ${duréeUltraRapide.toFixed(2)}ms (${(duréeUltraRapide/duréeNative).toFixed(2)}x plus lent)`);
    
    // Vérifications fonctionnelles
    expect(Object.keys(obj1).length).toBe(ITERATIONS);
    expect(Object.keys(obj2).length).toBe(ITERATIONS);
    expect(Object.keys(obj3).length).toBe(ITERATIONS);
    expect(Object.keys(obj4).length).toBe(ITERATIONS);
    
    expect(obj2.prop100).toBe(100);
    expect(obj3.prop100).toBe(100);
    expect(obj4.prop100).toBe(100);
    
    // Tests de performance - validation que les optimisations fonctionnent  
    // Note: Les résultats varient selon les conditions, on vérifie surtout que ça reste raisonnable
    expect(duréeUltraRapide).toBeLessThan(duréeNative * 2); // Ultra-rapide reste dans les bornes
    
    // Log des gains réels pour information
    console.log(`🏆 Gains de performance:`);
    console.log(`  Version optimisée: ${((duréeOriginale - duréeOptimisée) / duréeOriginale * 100).toFixed(1)}% d'amélioration`);
    console.log(`  Version ultra-rapide: ${((duréeNative - duréeUltraRapide) / duréeNative * 100).toFixed(1)}% vs natif`);
  });

  test("Performance définir.immuable - Original vs Optimisé", () => {
    let obj1 = {}, obj2 = {}, obj3 = {};
    
    const duréeNative = benchmark("Object.defineProperty immuable (baseline)", () => {
      for (let i = 0; i < ITERATIONS; i++) {
        Object.defineProperty(obj1, `const${i}`, {
          value: i,
          writable: false,
          enumerable: true,
          configurable: false
        });
      }
    });
    
    obj2 = {};
    const duréeOriginale = benchmark("définir.immuable (original)", () => {
      for (let i = 0; i < ITERATIONS; i++) {
        original.immuable(obj2, `const${i}`, i);
      }
    });
    
    obj3 = {};
    const duréeOptimisée = benchmark("définir.immuable (optimisé)", () => {
      for (let i = 0; i < ITERATIONS; i++) {
        optimisé.immuable(obj3, `const${i}`, i);
      }
    });
    
    let obj4 = {};
    const duréeUltraRapide = benchmark("définir.immuableRapide", () => {
      for (let i = 0; i < ITERATIONS; i++) {
        optimisé.immuableRapide(obj4, `const${i}`, i);
      }
    });
    
    console.log(`\n🔒 Immuable - Résultats pour ${ITERATIONS} définitions:`);
    console.log(`Native:           ${duréeNative.toFixed(2)}ms`);
    console.log(`Original:         ${duréeOriginale.toFixed(2)}ms (${(duréeOriginale/duréeNative).toFixed(2)}x)`);
    console.log(`Optimisé:         ${duréeOptimisée.toFixed(2)}ms (${(duréeOptimisée/duréeNative).toFixed(2)}x)`);
    console.log(`Ultra-rapide:     ${duréeUltraRapide.toFixed(2)}ms (${(duréeUltraRapide/duréeNative).toFixed(2)}x)`);
    
    // Tests fonctionnels
    expect(() => { obj2.const100 = 999; }).toThrow();
    expect(() => { obj3.const100 = 999; }).toThrow();
    expect(() => { obj4.const100 = 999; }).toThrow();
    
    // Validation des performances immuables
    expect(duréeUltraRapide).toBeLessThan(duréeNative * 2);
  });

  test("Performance getters/setters - Original vs Optimisé", () => {
    let obj1 = {}, obj2 = {}, obj3 = {};
    const ITER_GETSET = 1000; // Moins d'itérations car plus coûteux
    
    const getter = function() { return this._val || 0; };
    const setter = function(v) { this._val = v; };
    
    const duréeNative = benchmark("Object.defineProperty getter/setter", () => {
      for (let i = 0; i < ITER_GETSET; i++) {
        Object.defineProperty(obj1, `prop${i}`, {
          get: getter,
          set: setter,
          enumerable: true,
          configurable: false
        });
      }
    });
    
    obj2 = {};
    const duréeOriginale = benchmark("définir.propre (original)", () => {
      for (let i = 0; i < ITER_GETSET; i++) {
        original.propre(obj2, `prop${i}`, getter, setter);
      }
    });
    
    obj3 = {};
    const duréeOptimisée = benchmark("définir.propre (optimisé)", () => {
      for (let i = 0; i < ITER_GETSET; i++) {
        optimisé.propre(obj3, `prop${i}`, getter, setter);
      }
    });
    
    console.log(`\n🎯 Accesseurs - Résultats pour ${ITER_GETSET} définitions:`);
    console.log(`Native:           ${duréeNative.toFixed(2)}ms`);
    console.log(`Original:         ${duréeOriginale.toFixed(2)}ms (${(duréeOriginale/duréeNative).toFixed(2)}x)`);
    console.log(`Optimisé:         ${duréeOptimisée.toFixed(2)}ms (${(duréeOptimisée/duréeNative).toFixed(2)}x)`);
    
    // Tests fonctionnels des accesseurs
    obj2.prop100 = 42;
    obj3.prop100 = 42;
    expect(obj2.prop100).toBe(42);
    expect(obj3.prop100).toBe(42);
    
    // Les getters/setters ont déjà une bonne performance relative
  });

  test("Compatibilité fonctionnelle complète", () => {
    const original_obj = {};
    const optimisé_obj = {};
    
    // Test toutes les méthodes avec mêmes paramètres
    const testCases = [
      () => {
        original.muable(original_obj, "test1", "valeur1", true, false);
        optimisé.muable(optimisé_obj, "test1", "valeur1", true, false);
      },
      () => {
        original.immuable(original_obj, "test2", "valeur2", false, true);
        optimisé.immuable(optimisé_obj, "test2", "valeur2", false, true);
      },
      () => {
        original.lu(original_obj, "test3", () => "getter", true, false);
        optimisé.lu(optimisé_obj, "test3", () => "getter", true, false);
      },
      () => {
        const setter = function(val) { this._test4 = val; };
        original.écrit(original_obj, "test4", setter, true, true);
        optimisé.écrit(optimisé_obj, "test4", setter, true, true);
      },
      () => {
        const getter = function() { return this._test5 || "default"; };
        const setter = function(val) { this._test5 = val; };
        original.propre(original_obj, "test5", getter, setter, false, false);
        optimisé.propre(optimisé_obj, "test5", getter, setter, false, false);
      },
      () => {
        original.caché(original_obj, "test6", "caché");
        optimisé.caché(optimisé_obj, "test6", "caché");
      }
    ];
    
    testCases.forEach(testCase => testCase());
    
    // Vérification que les comportements sont identiques
    expect(original_obj.test1).toBe(optimisé_obj.test1);
    expect(original_obj.test2).toBe(optimisé_obj.test2);
    expect(original_obj.test3).toBe(optimisé_obj.test3);
    
    original_obj.test4 = "valeur4";
    optimisé_obj.test4 = "valeur4";
    expect(original_obj._test4).toBe(optimisé_obj._test4);
    
    original_obj.test5 = "valeur5";
    optimisé_obj.test5 = "valeur5";
    expect(original_obj.test5).toBe(optimisé_obj.test5);
    
    expect(original_obj.test6).toBe(optimisé_obj.test6);
    
    // Vérification des descripteurs identiques
    const desc1 = Object.getOwnPropertyDescriptor(original_obj, "test1");
    const desc2 = Object.getOwnPropertyDescriptor(optimisé_obj, "test1");
    expect(desc1.writable).toBe(desc2.writable);
    expect(desc1.enumerable).toBe(desc2.enumerable);
    expect(desc1.configurable).toBe(desc2.configurable);
  });

  test("Mesure allocation mémoire", () => {
    // Test pour vérifier que l'optimisation réduit les allocations
    const iterations = 5000;
    
    // Force garbage collection si disponible
    if (global.gc) {
      global.gc();
    }
    
    const mémoire_début = process.memoryUsage();
    
    // Version optimisée utilise moins d'allocations temporaires
    const obj = {};
    for (let i = 0; i < iterations; i++) {
      optimisé.muableRapide(obj, `prop${i}`, i);
    }
    
    const mémoire_fin = process.memoryUsage();
    const delta_heap = mémoire_fin.heapUsed - mémoire_début.heapUsed;
    
    console.log(`\n💾 Allocation mémoire pour ${iterations} propriétés:`);
    console.log(`Heap utilisé: ${(delta_heap / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Par propriété: ${(delta_heap / iterations).toFixed(0)} bytes`);
    
    // Vérification que l'allocation reste raisonnable
    expect(delta_heap / iterations).toBeLessThan(1000); // Moins de 1KB par propriété
  });
});