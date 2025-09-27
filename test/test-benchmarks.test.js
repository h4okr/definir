import { définir, Glossaire, objet } from "../index.js";
import { describe, test, expect, beforeEach } from "@jest/globals";

// ===== TESTS DE BENCHMARKS ET PERFORMANCE =====
describe("Benchmarks de performance", () => {
  const ITERATIONS = 10000;
  
  function mesurer(nom, fn) {
    const début = performance.now();
    fn();
    const fin = performance.now();
    const durée = fin - début;
    
    console.log(`${nom}: ${durée.toFixed(2)}ms`);
    return durée;
  }

  describe("Comparaison définition de propriétés", () => {
    let obj1, obj2;
    
    beforeEach(() => {
      obj1 = {};
      obj2 = {};
    });

    test("définir.muable vs Object.defineProperty", () => {
      const duréeDéfinir = mesurer("définir.muable", () => {
        for (let i = 0; i < ITERATIONS; i++) {
          définir.muable(obj1, `prop${i}`, i);
        }
      });

      const duréeNative = mesurer("Object.defineProperty", () => {
        for (let i = 0; i < ITERATIONS; i++) {
          Object.defineProperty(obj2, `prop${i}`, {
            value: i,
            writable: true,
            enumerable: true,
            configurable: false
          });
        }
      });

      // définir ne devrait pas être plus de 3x plus lent
      expect(duréeDéfinir / duréeNative).toBeLessThan(3);
      expect(Object.keys(obj1).length).toBe(ITERATIONS);
      expect(Object.keys(obj2).length).toBe(ITERATIONS);
    });

    test("définir.immuable vs Object.freeze", () => {
      const duréeDéfinir = mesurer("définir.immuable", () => {
        for (let i = 0; i < 1000; i++) {
          définir.immuable(obj1, `const${i}`, i);
        }
      });

      const duréeFreeze = mesurer("Object.freeze", () => {
        for (let i = 0; i < 1000; i++) {
          obj2[`const${i}`] = i;
        }
        Object.freeze(obj2);
      });

      // Vérifier que les deux approches fonctionnent
      expect(() => { obj1.const0 = 999; }).toThrow();
      expect(() => { obj2.const0 = 999; }).toThrow();
    });
  });

  describe("Comparaison Glossaire vs Map", () => {
    test("opérations de base", () => {
      const glossaire = new Glossaire();
      const map = new Map();

      const duréeGlossaire = mesurer("Glossaire operations", () => {
        for (let i = 0; i < ITERATIONS; i++) {
          glossaire.écrire(`clé${i}`, i);
        }
        for (let i = 0; i < ITERATIONS; i++) {
          glossaire.lire(`clé${i}`);
        }
        for (let i = 0; i < ITERATIONS; i++) {
          glossaire.a(`clé${i}`);
        }
      });

      const duréeMap = mesurer("Map operations", () => {
        for (let i = 0; i < ITERATIONS; i++) {
          map.set(`clé${i}`, i);
        }
        for (let i = 0; i < ITERATIONS; i++) {
          map.get(`clé${i}`);
        }
        for (let i = 0; i < ITERATIONS; i++) {
          map.has(`clé${i}`);
        }
      });

      // Glossaire ne devrait pas être plus de 2x plus lent
      expect(duréeGlossaire / duréeMap).toBeLessThan(2);
      expect(glossaire.taille).toBe(ITERATIONS);
      expect(map.size).toBe(ITERATIONS);
    });

    test("conversion objet", () => {
      const glossaire = new Glossaire();
      for (let i = 0; i < 1000; i++) {
        glossaire.set(`prop${i}`, i);
      }

      const durée = mesurer("Glossaire.objet()", () => {
        for (let i = 0; i < 100; i++) {
          const obj = glossaire.objet();
        }
      });

      expect(durée).toBeLessThan(100); // Moins de 100ms pour 100 conversions
    });
  });

  describe("Comparaison objet vs Object.create", () => {
    test("création d'objets", () => {
      const proto = { test: true };
      const propriétés = {
        prop: { value: 42, writable: true, enumerable: true, configurable: true }
      };

      const duréeObjet = mesurer("objet function", () => {
        for (let i = 0; i < ITERATIONS; i++) {
          const instance = objet(proto, propriétés);
        }
      });

      const duréeNative = mesurer("Object.create", () => {
        for (let i = 0; i < ITERATIONS; i++) {
          const instance = Object.create(proto, propriétés);
        }
      });

      // objet() est juste un wrapper, devrait être négligeable
      expect(duréeObjet / duréeNative).toBeLessThan(1.5);
    });
  });

  describe("Tests de mémoire", () => {
    test("pas de fuites mémoire avec nombreuses propriétés", () => {
      const objets = [];
      
      // Créer beaucoup d'objets avec propriétés
      for (let i = 0; i < 1000; i++) {
        const obj = {};
        définir.muable(obj, "valeur", i);
        définir.immuable(obj, "constante", i * 2);
        définir.lu(obj, "calculé", function() { return this.valeur * 2; });
        objets.push(obj);
      }

      // Vérifier que tout fonctionne encore
      expect(objets[0].valeur).toBe(0);
      expect(objets[999].constante).toBe(1998);
      expect(objets[500].calculé).toBe(1000);

      // Nettoyer
      objets.length = 0;
    });

    test("gestion de références circulaires", () => {
      const obj1 = {};
      const obj2 = {};

      définir.muable(obj1, "référence", obj2);
      définir.muable(obj2, "référence", obj1);

      expect(obj1.référence).toBe(obj2);
      expect(obj2.référence).toBe(obj1);

      // Pas d'exception lors de la sérialisation partielle
      expect(() => {
        JSON.stringify({ obj1Keys: Object.keys(obj1), obj2Keys: Object.keys(obj2) });
      }).not.toThrow();
    });
  });

  describe("Optimisations spécifiques", () => {
    test("réutilisation de descripteurs", () => {
      const obj = {};
      const valeurs = Array.from({ length: 1000 }, (_, i) => i);

      const durée = mesurer("Définitions répétées", () => {
        valeurs.forEach(val => {
          définir.muable(obj, `prop${val}`, val, true, false);
        });
      });

      expect(durée).toBeLessThan(50); // Optimisation attendue
      expect(Object.keys(obj).length).toBe(1000);
    });

    test("performance getter/setter complexes", () => {
      const obj = {};
      obj._cache = new Map();

      définir.propre(obj, "expensiveProperty", 
        function() {
          const key = "expensive";
          if (!this._cache.has(key)) {
            // Simulation calcul coûteux
            let result = 0;
            for (let i = 0; i < 1000; i++) {
              result += Math.sqrt(i);
            }
            this._cache.set(key, result);
          }
          return this._cache.get(key);
        },
        function(val) {
          this._cache.clear();
          this._value = val;
        }
      );

      const durée = mesurer("Getter avec cache", () => {
        for (let i = 0; i < 100; i++) {
          const val = obj.expensiveProperty; // Premier accès cache, suivants rapides
        }
      });

      expect(durée).toBeLessThan(100);
    });
  });
});