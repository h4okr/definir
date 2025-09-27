import { définir, Glossaire, objet } from "../index.js";
import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";

// ===== TESTS D'INTÉGRATION AVANCÉS =====
describe("Tests d'intégration avancés", () => {
  
  describe("Intégration avec écosystème JavaScript", () => {
    test("compatibilité avec Proxy", () => {
      const obj = {};
      définir.muable(obj, "valeur", 10);
      définir.caché(obj, "secret", "caché");

      const accès = [];
      const proxy = new Proxy(obj, {
        get(target, prop) {
          accès.push(`get:${String(prop)}`);
          return target[prop];
        },
        set(target, prop, value) {
          accès.push(`set:${String(prop)}`);
          target[prop] = value;
          return true;
        }
      });

      proxy.valeur = 20;
      const val = proxy.valeur;
      const secret = proxy.secret;

      expect(val).toBe(20);
      expect(secret).toBe("caché");
      expect(accès).toContain("set:valeur");
      expect(accès).toContain("get:valeur");
      expect(accès).toContain("get:secret");
    });

    test("compatibilité avec WeakMap/WeakSet", () => {
      const weakMap = new WeakMap();
      const weakSet = new WeakSet();
      
      const obj1 = {};
      const obj2 = {};
      
      définir.immuable(obj1, "id", "objet1");
      définir.immuable(obj2, "id", "objet2");
      
      weakMap.set(obj1, "données privées 1");
      weakMap.set(obj2, "données privées 2");
      
      weakSet.add(obj1);
      weakSet.add(obj2);
      
      expect(weakMap.get(obj1)).toBe("données privées 1");
      expect(weakSet.has(obj2)).toBe(true);
      expect(obj1.id).toBe("objet1");
    });

    test("intégration avec async/await", async () => {
      const obj = {};
      let résoluValue;
      
      définir.lu(obj, "asyncValue", function() {
        return Promise.resolve(42);
      });
      
      définir.écrit(obj, "asyncSetter", function(promise) {
        promise.then(val => résoluValue = val);
      });

      const promise = obj.asyncValue;
      const result = await promise;
      
      obj.asyncSetter = Promise.resolve(100);
      await new Promise(resolve => setTimeout(resolve, 0)); // Attendre microtask
      
      expect(result).toBe(42);
      expect(résoluValue).toBe(100);
    });

    test("interaction avec Symbol", () => {
      const obj = {};
      const symProp = Symbol("propriétéSymbol");
      
      définir.muable(obj, symProp, "valeur symbol");
      
      expect(obj[symProp]).toBe("valeur symbol");
      
      // Tester avec Symbol.toStringTag
      const symToString = Symbol.toStringTag;
      définir.immuable(obj, symToString, "MonObjet");
      
      expect(Object.prototype.toString.call(obj)).toBe("[object MonObjet]");
    });
  });

  describe("Patterns avancés avec définir", () => {
    test("pattern Observable", () => {
      const observateurs = [];
      const observable = {};
      
      function notifier(prop, ancien, nouveau) {
        observateurs.forEach(obs => obs(prop, ancien, nouveau));
      }
      
      définir.propre(observable, "valeur",
        function() { return this._valeur || 0; },
        function(nouveau) {
          const ancien = this._valeur || 0; // Valeur par défaut
          this._valeur = nouveau;
          notifier("valeur", ancien, nouveau);
        }
      );
      
      const changements = [];
      observateurs.push((prop, ancien, nouveau) => {
        changements.push({ prop, ancien, nouveau });
      });
      
      observable.valeur = 10;
      observable.valeur = 20;
      
      expect(changements).toHaveLength(2);
      expect(changements[0]).toEqual({ prop: "valeur", ancien: 0, nouveau: 10 });
      expect(changements[1]).toEqual({ prop: "valeur", ancien: 10, nouveau: 20 });
    });

    test("pattern Memento/Snapshot", () => {
      const obj = {};
      const historique = [];
      
      définir.muable(obj, "nom", "");
      définir.muable(obj, "age", 0);
      
      définir.lu(obj, "snapshot", function() {
        return { nom: this.nom, age: this.age, timestamp: Date.now() };
      });
      
      définir.écrit(obj, "restore", function(snapshot) {
        if (snapshot && typeof snapshot === 'object') {
          this.nom = snapshot.nom || "";
          this.age = snapshot.age || 0;
        }
      });
      
      obj.nom = "Alice";
      obj.age = 30;
      const snap1 = obj.snapshot;
      
      obj.nom = "Bob";
      obj.age = 25;
      
      obj.restore = snap1;
      
      expect(obj.nom).toBe("Alice");
      expect(obj.age).toBe(30);
    });

    test("pattern Fluent Interface", () => {
      const builder = {};
      
      définir.écrit(builder, "nom", function(val) {
        this._nom = val;
        return this;
      });
      
      définir.écrit(builder, "age", function(val) {
        this._age = val;
        return this;
      });
      
      définir.lu(builder, "build", function() {
        return { nom: this._nom, age: this._age };
      });
      
      // Ne fonctionne pas directement avec les setters, mais on peut adapter
      builder.nom = "Charlie";
      const result1 = builder;
      result1.age = 35;
      const result2 = result1;
      
      expect(builder._nom).toBe("Charlie");
      expect(builder._age).toBe(35);
    });
  });

  describe("Intégration complexe Glossaire", () => {
    test("Glossaire comme cache intelligent", () => {
      const cache = new Glossaire();
      const stats = { hits: 0, misses: 0 };
      
      // Override get pour ajouter des stats
      const originalGet = cache.get;
      cache.get = function(key) {
        const value = originalGet.call(this, key);
        if (value !== undefined) {
          stats.hits++;
        } else {
          stats.misses++;
        }
        return value;
      };
      
      // Méthode getOrCompute
      cache.getOrCompute = function(key, computer) {
        let value = this.get(key);
        if (value === undefined) {
          value = computer(key);
          this.set(key, value);
        }
        return value;
      };
      
      const result1 = cache.getOrCompute("fibonacci10", (key) => {
        // Calcul correct de fibonacci(10)
        let a = 0, b = 1;
        for (let i = 2; i <= 10; i++) {
          [a, b] = [b, a + b];
        }
        return b;
      });
      
      const result2 = cache.getOrCompute("fibonacci10", (key) => {
        throw new Error("Ne devrait pas être appelé");
      });
      
      expect(result1).toBe(55); // Fibonacci(10) correct  
      expect(result2).toBe(55);
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
    });

    test("Glossaire avec expiration TTL", () => {
      const ttlCache = new Glossaire();
      const TTL = 100; // ms
      
      ttlCache.setWithTTL = function(key, value, ttl = TTL) {
        const expiry = Date.now() + ttl;
        this.set(key, { value, expiry });
      };
      
      const originalGet = ttlCache.get;
      ttlCache.get = function(key) {
        const item = originalGet.call(this, key);
        if (!item) return undefined;
        
        if (Date.now() > item.expiry) {
          this.delete(key);
          return undefined;
        }
        
        return item.value;
      };
      
      ttlCache.setWithTTL("temp", "temporaire", 50);
      
      expect(ttlCache.get("temp")).toBe("temporaire");
      
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(ttlCache.get("temp")).toBeUndefined();
          resolve();
        }, 60);
      });
    });
  });

  describe("Intégration module objet avec héritage complexe", () => {
    test("héritage multiple simulé", () => {
      // Mixins
      const EventEmitter = {
        emit: function(event, data) {
          (this._listeners[event] || []).forEach(fn => fn(data));
        },
        on: function(event, fn) {
          this._listeners = this._listeners || {};
          this._listeners[event] = this._listeners[event] || [];
          this._listeners[event].push(fn);
        }
      };
      
      const Serializable = {
        toJSON: function() {
          const result = {};
          Object.keys(this).forEach(key => {
            if (!key.startsWith('_')) {
              result[key] = this[key];
            }
          });
          return result;
        },
        fromJSON: function(data) {
          Object.keys(data).forEach(key => {
            this[key] = data[key];
          });
        }
      };
      
      function MaClasse(nom) {
        this.nom = nom;
        this._listeners = {};
      }
      
      // Combiner les mixins
      const comportements = objet.fusion({}, 
        objet.constructeur(MaClasse),
        EventEmitter,
        Serializable
      );
      
      // Créer le descripteur avec les méthodes
      const descripteurs = {};
      Object.keys(comportements).forEach(key => {
        descripteurs[key] = {
          value: comportements[key],
          writable: true,
          enumerable: key !== 'constructor',
          configurable: true
        };
      });
      
      objet.hérite(MaClasse, Object.prototype, descripteurs);
      
      const instance = new MaClasse("test");
      
      let émis = null;
      instance.on("changement", (data) => émis = data);
      instance.emit("changement", "données");
      
      expect(émis).toBe("données");
      expect(instance.toJSON()).toEqual({ nom: "test" });
    });

    test("chaîne de prototypes complexe", () => {
      // Base -> Milieu -> Final
      function Base() { this.niveau = "base"; }
      Base.prototype.méthodeBase = function() { return "base"; };
      
      function Milieu() { 
        Base.call(this);
        this.niveau = "milieu"; 
      }
      objet.hérite(Milieu, Base.prototype);
      Milieu.prototype.méthodeMilieu = function() { return "milieu"; };
      
      function Final() { 
        Milieu.call(this);
        this.niveau = "final"; 
      }
      objet.hérite(Final, Milieu.prototype);
      Final.prototype.méthodeFinal = function() { return "final"; };
      
      const instance = new Final();
      
      expect(instance.niveau).toBe("final");
      expect(instance.méthodeBase()).toBe("base");
      expect(instance.méthodeMilieu()).toBe("milieu");
      expect(instance.méthodeFinal()).toBe("final");
      expect(instance instanceof Base).toBe(true);
      expect(instance instanceof Milieu).toBe(true);
      expect(instance instanceof Final).toBe(true);
    });
  });

  describe("Cas limites et robustesse", () => {
    test("propriétés avec caractères spéciaux", () => {
      const obj = {};
      const nomsSpéciaux = [
        "propriété avec espaces",
        "propriété-avec-tirets", 
        "propriété_avec_underscores",
        "propriété.avec.points",
        "propriété[avec]crochets",
        "propriété{avec}accolades",
        "propriété(avec)parenthèses",
        "propriété@avec#caractères$spéciaux",
        "🚀propriété🚀avec🚀emojis🚀",
        "propriétéAvecAccents_àéèùç",
        "",  // chaîne vide
        " ", // espace seul
        "\n", // nouvelle ligne
        "\t"  // tabulation
      ];
      
      nomsSpéciaux.forEach((nom, index) => {
        expect(() => {
          définir.muable(obj, nom, `valeur${index}`);
          expect(obj[nom]).toBe(`valeur${index}`);
        }).not.toThrow();
      });
    });

    test("valeurs extrêmes", () => {
      const obj = {};
      const valeursExtrêmes = [
        Number.MAX_VALUE,
        Number.MIN_VALUE,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NaN,
        "",
        " ".repeat(10000), // Très longue chaîne
        Array(1000).fill(0), // Grand tableau
        new ArrayBuffer(1024), // Buffer binaire
        new Date("1970-01-01"), // Date epoch
        new Date("2099-12-31"), // Date future
        /^test.*$/gi, // RegExp
        function() {}, // Fonction
        () => {}, // Arrow function
        async () => {}, // Async function
        function*() {}, // Generator function
      ];
      
      valeursExtrêmes.forEach((valeur, index) => {
        expect(() => {
          définir.immuable(obj, `extrême${index}`, valeur);
          // Vérifier que la valeur est préservée exactement
          expect(obj[`extrême${index}`]).toBe(valeur);
        }).not.toThrow();
      });
    });

    test("gestion d'erreurs dans getters/setters", () => {
      const obj = {};
      const erreurs = [];
      
      // Capturer les erreurs
      const originalError = console.error;
      console.error = (...args) => erreurs.push(args);
      
      définir.lu(obj, "getterErreur", function() {
        if (this._shouldThrow) {
          throw new Error("Erreur dans getter");
        }
        return "valeur normale";
      });
      
      définir.écrit(obj, "setterErreur", function(val) {
        if (val === "ERREUR") {
          throw new Error("Erreur dans setter");
        }
        this._valeur = val;
      });
      
      // Cas normaux
      expect(obj.getterErreur).toBe("valeur normale");
      obj.setterErreur = "ok";
      expect(obj._valeur).toBe("ok");
      
      // Cas d'erreur
      obj._shouldThrow = true;
      expect(() => obj.getterErreur).toThrow("Erreur dans getter");
      expect(() => { obj.setterErreur = "ERREUR"; }).toThrow("Erreur dans setter");
      
      // Restaurer
      console.error = originalError;
    });

    test("comportement avec this modifié", () => {
      const obj1 = { nom: "obj1" };
      const obj2 = { nom: "obj2" };
      
      définir.lu(obj1, "getNom", function() {
        return this.nom;
      });
      
      // Utilisation normale
      expect(obj1.getNom).toBe("obj1");
      
      // Binding explicite
      const getterBound = Object.getOwnPropertyDescriptor(obj1, "getNom").get.bind(obj2);
      expect(getterBound()).toBe("obj2");
      
      // Appel avec call
      const getter = Object.getOwnPropertyDescriptor(obj1, "getNom").get;
      expect(getter.call(obj2)).toBe("obj2");
    });
  });

  describe("Tests de stress", () => {
    test("nombreuses redéfinitions", () => {
      const obj = {};
      
      for (let i = 0; i < 1000; i++) {
        définir.muable(obj, "prop", i, true, true); // configurable: true
        expect(obj.prop).toBe(i);
      }
    });

    test("références circulaires complexes", () => {
      const a = {};
      const b = {};
      const c = {};
      
      définir.muable(a, "ref", b);
      définir.muable(b, "ref", c);  
      définir.muable(c, "ref", a);
      
      définir.lu(a, "circularAccess", function() {
        return this.ref.ref.ref === this;
      });
      
      expect(a.circularAccess).toBe(true);
    });

    test("très grand nombre de propriétés", () => {
      const obj = {};
      const GRAND_NOMBRE = 10000;
      
      for (let i = 0; i < GRAND_NOMBRE; i++) {
        définir.muable(obj, `prop${i}`, i);
      }
      
      expect(Object.keys(obj).length).toBe(GRAND_NOMBRE);
      expect(obj.prop0).toBe(0);
      expect(obj[`prop${GRAND_NOMBRE-1}`]).toBe(GRAND_NOMBRE-1);
    });
  });
});