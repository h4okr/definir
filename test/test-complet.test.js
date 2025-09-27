import { définir, Glossaire, objet } from "../index.js";
import { direct, indirect } from "../descripteur.js";
import fusion from "../fusion.js";
import { test, describe, it, expect, beforeEach } from "@jest/globals";

// ===== TESTS DE BASE - EXISTENCE ET TYPES =====
describe("Exports principaux", () => {
  test("existence des exports", () => {
    expect(définir).toBeDefined();
    expect(Glossaire).toBeDefined();
    expect(objet).toBeDefined();
  });

  test("types corrects", () => {
    expect(typeof définir).toBe("function");
    expect(typeof Glossaire).toBe("function");
    expect(typeof objet).toBe("function");
  });

  test("méthodes attachées à définir", () => {
    expect(définir).toHaveProperty("immuable");
    expect(définir).toHaveProperty("muable");
    expect(définir).toHaveProperty("lu");
    expect(définir).toHaveProperty("écrit");
    expect(définir).toHaveProperty("propre");
    expect(définir).toHaveProperty("caché");
  });
});

// ===== TESTS DU MODULE DÉFINIR =====
describe("Fonction définir", () => {
  let testObj;

  beforeEach(() => {
    testObj = {};
  });

  test("fonction de base - wrapper de Object.defineProperty", () => {
    const descriptor = { value: 42, writable: true, enumerable: true, configurable: true };
    const result = définir(testObj, "test", descriptor);
    
    expect(result).toBe(testObj);
    expect(testObj.test).toBe(42);
    expect(Object.getOwnPropertyDescriptor(testObj, "test")).toEqual(descriptor);
  });

  describe("définir.immuable", () => {
    test("crée une propriété en lecture seule", () => {
      définir.immuable(testObj, "constante", "valeur");
      
      expect(testObj.constante).toBe("valeur");
      expect(() => { testObj.constante = "nouvelle"; }).toThrow();
    });

    test("paramètres de visibilité", () => {
      définir.immuable(testObj, "visible", 1, true, false);
      définir.immuable(testObj, "invisible", 2, false, false);
      
      const props = Object.keys(testObj);
      expect(props).toContain("visible");
      expect(props).not.toContain("invisible");
    });

    test("paramètre configurable", () => {
      définir.immuable(testObj, "nonConfig", 1, true, false);
      définir.immuable(testObj, "config", 2, true, true);
      
      // Les propriétés non-configurables ne peuvent pas être supprimées en strict mode
      try {
        delete testObj.nonConfig;
      } catch (e) {
        // Comportement attendu en strict mode
      }
      expect(testObj.nonConfig).toBe(1); // toujours là
      
      delete testObj.config;
      expect(testObj.config).toBeUndefined();
    });

    test("retourne définir pour chaînage", () => {
      const result = définir.immuable(testObj, "test", 1);
      expect(result).toBe(définir);
    });

    test("valeurs diverses", () => {
      const valeurs = [null, undefined, 0, "", false, [], {}, Symbol("test")];
      
      valeurs.forEach((val, index) => {
        définir.immuable(testObj, `test${index}`, val);
        expect(testObj[`test${index}`]).toBe(val);
      });
    });
  });

  describe("définir.muable", () => {
    test("crée une propriété modifiable", () => {
      définir.muable(testObj, "variable", 10);
      
      expect(testObj.variable).toBe(10);
      testObj.variable = 20;
      expect(testObj.variable).toBe(20);
    });

    test("paramètres par défaut", () => {
      définir.muable(testObj, "defaut", 5);
      const desc = Object.getOwnPropertyDescriptor(testObj, "defaut");
      
      expect(desc.writable).toBe(true);
      expect(desc.enumerable).toBe(true);
      expect(desc.configurable).toBe(false);
    });

    test("redéfinition d'une propriété muable existante", () => {
      définir.muable(testObj, "redefinir", 1, true, true);
      définir.muable(testObj, "redefinir", 2, true, true);
      
      expect(testObj.redefinir).toBe(2);
    });

    test("types de valeurs diverses", () => {
      définir.muable(testObj, "string", "test");
      définir.muable(testObj, "number", 42);
      définir.muable(testObj, "boolean", true);
      définir.muable(testObj, "object", { a: 1 });
      
      testObj.string = "modifié";
      testObj.number = 100;
      testObj.boolean = false;
      testObj.object = { b: 2 };
      
      expect(testObj.string).toBe("modifié");
      expect(testObj.number).toBe(100);
      expect(testObj.boolean).toBe(false);
      expect(testObj.object).toEqual({ b: 2 });
    });
  });

  describe("définir.lu", () => {
    test("crée un getter sans setter", () => {
      testObj.valeurInterne = 5;
      définir.lu(testObj, "lecture", function() { return this.valeurInterne * 2; });
      
      expect(testObj.lecture).toBe(10);
      expect(() => { testObj.lecture = 20; }).toThrow();
    });

    test("getter avec contexte this", () => {
      testObj.nom = "Jean";
      testObj.age = 30;
      définir.lu(testObj, "présentation", function() { 
        return `${this.nom} (${this.age} ans)`;
      });
      
      expect(testObj.présentation).toBe("Jean (30 ans)");
      
      testObj.nom = "Marie";
      expect(testObj.présentation).toBe("Marie (30 ans)");
    });

    test("getter sans fonction (undefined)", () => {
      définir.lu(testObj, "undefined", undefined);
      expect(testObj.undefined).toBeUndefined();
    });
  });

  describe("définir.écrit", () => {
    test("crée un setter sans getter", () => {
      testObj.stockage = [];
      définir.écrit(testObj, "ajouter", function(valeur) {
        this.stockage.push(valeur);
      });
      
      expect(testObj.ajouter).toBeUndefined();
      testObj.ajouter = "item1";
      testObj.ajouter = "item2";
      
      expect(testObj.stockage).toEqual(["item1", "item2"]);
    });

    test("setter avec validation", () => {
      définir.écrit(testObj, "positif", function(valeur) {
        if (valeur < 0) throw new Error("Doit être positif");
        this._valeur = valeur;
      });
      
      testObj.positif = 5;
      expect(testObj._valeur).toBe(5);
      
      expect(() => { testObj.positif = -1; }).toThrow("Doit être positif");
    });
  });

  describe("définir.propre", () => {
    test("crée getter et setter", () => {
      testObj._interne = 0;
      
      définir.propre(
        testObj,
        "valeur",
        function() { return this._interne; },
        function(val) { this._interne = val; }
      );
      
      expect(testObj.valeur).toBe(0);
      testObj.valeur = 42;
      expect(testObj.valeur).toBe(42);
      expect(testObj._interne).toBe(42);
    });

    test("getter et setter avec logique métier", () => {
      testObj._température = 0; // en Celsius
      
      définir.propre(
        testObj,
        "fahrenheit",
        function() { return (this._température * 9/5) + 32; },
        function(f) { this._température = (f - 32) * 5/9; }
      );
      
      testObj._température = 100; // 100°C
      expect(testObj.fahrenheit).toBe(212); // 212°F
      
      testObj.fahrenheit = 32; // 32°F
      expect(testObj._température).toBeCloseTo(0); // 0°C
    });
  });

  describe("définir.caché", () => {
    test("crée propriété non-enumerable", () => {
      définir.caché(testObj, "secret", "valeur secrète");
      
      expect(testObj.secret).toBe("valeur secrète");
      expect(Object.keys(testObj)).not.toContain("secret");
      expect(Object.getOwnPropertyNames(testObj)).toContain("secret");
    });

    test("propriété cachée modifiable", () => {
      définir.caché(testObj, "cache", 1);
      
      testObj.cache = 2;
      expect(testObj.cache).toBe(2);
    });

    test("paramètre configurable", () => {
      définir.caché(testObj, "cachéConfig", 1, true);
      
      delete testObj.cachéConfig;
      expect(testObj.cachéConfig).toBeUndefined();
    });
  });
});

// ===== TESTS DU MODULE DESCRIPTEUR =====
describe("Module descripteur", () => {
  describe("fonction direct", () => {
    test("descripteur de valeur avec paramètres par défaut", () => {
      const desc = direct(42);
      
      expect(desc).toEqual({
        value: 42,
        writable: true,
        enumerable: true,
        configurable: false
      });
    });

    test("descripteur immuable", () => {
      const desc = direct("constante", false, true, false);
      
      expect(desc).toEqual({
        value: "constante",
        writable: false,
        enumerable: true,
        configurable: false
      });
    });

    test("descripteur caché", () => {
      const desc = direct("caché", true, false, true);
      
      expect(desc).toEqual({
        value: "caché",
        writable: true,
        enumerable: false,
        configurable: true
      });
    });
  });

  describe("fonction indirect", () => {
    const getter = () => "lu";
    const setter = (val) => {};

    test("descripteur avec getter seul", () => {
      const desc = indirect(getter, undefined);
      
      expect(desc).toEqual({
        get: getter,
        set: undefined,
        enumerable: true,
        configurable: false
      });
    });

    test("descripteur avec setter seul", () => {
      const desc = indirect(undefined, setter);
      
      expect(desc).toEqual({
        get: undefined,
        set: setter,
        enumerable: true,
        configurable: false
      });
    });

    test("descripteur avec getter et setter", () => {
      const desc = indirect(getter, setter, false, true);
      
      expect(desc).toEqual({
        get: getter,
        set: setter,
        enumerable: false,
        configurable: true
      });
    });
  });
});

// ===== TESTS DU MODULE FUSION =====
describe("Module fusion", () => {
  test("fusion d'objets simple", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { c: 3 };
    const résultat = fusion(obj1, obj2);
    
    expect(résultat).toBe(obj1); // modification en place
    expect(obj1).toEqual({ a: 1, b: 2, c: 3 });
  });

  test("fusion multiple", () => {
    const cible = {};
    const résultat = fusion(cible, { a: 1 }, { b: 2 }, { c: 3 });
    
    expect(résultat).toEqual({ a: 1, b: 2, c: 3 });
  });

  test("écrasement de propriétés", () => {
    const cible = { a: 1 };
    fusion(cible, { a: 2, b: 3 }, { a: 4 });
    
    expect(cible).toEqual({ a: 4, b: 3 });
  });
});

// ===== TESTS DE LA CLASSE GLOSSAIRE =====
describe("Classe Glossaire", () => {
  let glossaire;

  beforeEach(() => {
    glossaire = new Glossaire();
  });

  test("hérite de Map", () => {
    expect(glossaire instanceof Map).toBe(true);
    expect(glossaire instanceof Glossaire).toBe(true);
  });

  test("constructeur avec entrées initiales", () => {
    const g = new Glossaire([["a", 1], ["b", 2]]);
    
    expect(g.size).toBe(2);
    expect(g.get("a")).toBe(1);
    expect(g.get("b")).toBe(2);
  });

  test("propriété taille", () => {
    expect(glossaire.taille).toBe(0);
    
    glossaire.set("test", 1);
    expect(glossaire.taille).toBe(1);
  });

  test("méthodes françaises", () => {
    // Écriture et lecture
    glossaire.écrire("clé", "valeur");
    expect(glossaire.lire("clé")).toBe("valeur");
    
    // Test d'existence
    expect(glossaire.a("clé")).toBe(true);
    expect(glossaire.a("inexistant")).toBe(false);
    
    // Suppression
    glossaire.supprimer("clé");
    expect(glossaire.a("clé")).toBe(false);
  });

  test("méthode objet - conversion en objet", () => {
    glossaire.set("a", 1);
    glossaire.set("b", 2);
    
    const obj = glossaire.objet();
    expect(obj).toEqual({ a: 1, b: 2 });
    expect(obj).not.toBe(glossaire); // nouvelle instance
  });

  test("méthode itérer", () => {
    glossaire.set("x", 10);
    glossaire.set("y", 20);
    
    const résultats = [];
    glossaire.itérer((valeur, clé) => {
      résultats.push({ clé, valeur });
    });
    
    expect(résultats).toEqual([
      { clé: "x", valeur: 10 },
      { clé: "y", valeur: 20 }
    ]);
  });

  test("méthode itérer avec contexte personnalisé", () => {
    glossaire.set("test", 5);
    
    const contexte = { multiplicateur: 3 };
    const résultats = [];
    
    glossaire.itérer(function(valeur, clé) {
      résultats.push(valeur * this.multiplicateur);
    }, contexte);
    
    expect(résultats).toEqual([15]);
  });

  test("méthode vider", () => {
    glossaire.set("a", 1);
    glossaire.set("b", 2);
    
    expect(glossaire.size).toBe(2);
    glossaire.vider();
    expect(glossaire.size).toBe(0);
  });

  test("compatibilité avec Map native", () => {
    // Toutes les méthodes Map doivent fonctionner
    glossaire.set("test", "valeur");
    
    expect(glossaire.has("test")).toBe(true);
    expect(glossaire.get("test")).toBe("valeur");
    expect(glossaire.delete("test")).toBe(true);
    expect(glossaire.has("test")).toBe(false);
  });
});

// ===== TESTS DU MODULE OBJET =====
describe("Module objet", () => {
  test("fonction principale - wrapper de Object.create", () => {
    const proto = { méthode: () => "test" };
    const propriétés = {
      prop: { value: 42, writable: true, enumerable: true, configurable: true }
    };
    
    const instance = objet(proto, propriétés);
    
    expect(Object.getPrototypeOf(instance)).toBe(proto);
    expect(instance.prop).toBe(42);
    expect(instance.méthode()).toBe("test");
  });

  describe("objet.fusion", () => {
    test("référence vers fusion", () => {
      expect(objet.fusion).toBe(fusion);
    });
  });

  describe("objet.constructeur", () => {
    test("génère descripteur constructor", () => {
      function MaClasse() {}
      const desc = objet.constructeur(MaClasse);
      
      expect(desc).toEqual({
        constructor: {
          value: MaClasse,
          writable: true,
          enumerable: false,
          configurable: true
        }
      });
    });
  });

  describe("objet.propriétés", () => {
    test("référence vers Object.keys", () => {
      expect(objet.propriétés).toBe(Object.keys);
      
      const obj = { a: 1, b: 2 };
      expect(objet.propriétés(obj)).toEqual(["a", "b"]);
    });
  });

  describe("objet.entrées", () => {
    test("référence vers Object.entries", () => {
      expect(objet.entrées).toBe(Object.entries);
      
      const obj = { a: 1, b: 2 };
      expect(objet.entrées(obj)).toEqual([["a", 1], ["b", 2]]);
    });
  });

  describe("objet.glossaire", () => {
    test("convertit objet en Glossaire", () => {
      const obj = { x: 10, y: 20 };
      const g = objet.glossaire(obj);
      
      expect(g instanceof Glossaire).toBe(true);
      expect(g.get("x")).toBe(10);
      expect(g.get("y")).toBe(20);
    });
  });

  describe("objet.hérite", () => {
    test("établit héritage de prototype", () => {
      function Parent() {
        this.type = "parent";
      }
      Parent.prototype.méthodeParent = function() { return "parent"; };
      
      function Enfant() {
        this.type = "enfant";
      }
      
      objet.hérite(Enfant, Parent.prototype);
      
      const instance = new Enfant();
      expect(instance.type).toBe("enfant");
      expect(instance.méthodeParent()).toBe("parent");
      expect(instance.constructor).toBe(Enfant);
    });

    test("héritage avec comportements supplémentaires", () => {
      function Base() {}
      Base.prototype.base = function() { return "base"; };
      
      function Dérivée() {}
      
      const comportements = {
        nouvelle: { 
          value: function() { return "nouvelle"; }, 
          writable: true, 
          enumerable: true, 
          configurable: true 
        }
      };
      
      objet.hérite(Dérivée, Base.prototype, comportements);
      
      const instance = new Dérivée();
      expect(instance.base()).toBe("base");
      expect(instance.nouvelle()).toBe("nouvelle");
      expect(instance.constructor).toBe(Dérivée);
    });
  });
});

// ===== TESTS D'INTÉGRATION =====
describe("Tests d'intégration", () => {
  test("utilisation complète de la librairie", () => {
    // Créer un objet avec différents types de propriétés
    const personne = {};
    
    définir.immuable(personne, "espèce", "Homo sapiens");
    définir.muable(personne, "nom", "");
    définir.muable(personne, "age", 0);
    définir.caché(personne, "_id", Math.random());
    
    définir.propre(
      personne,
      "présentation",
      function() { return `${this.nom} (${this.age} ans)`; },
      undefined // lecture seule
    );
    
    // Tester les propriétés
    personne.nom = "Alice";
    personne.age = 30;
    
    expect(personne.espèce).toBe("Homo sapiens");
    expect(personne.présentation).toBe("Alice (30 ans)");
    expect(() => { personne.espèce = "autre"; }).toThrow();
    
    // Vérifier la visibilité
    const props = Object.keys(personne);
    expect(props).toContain("nom");
    expect(props).toContain("age");
    expect(props).not.toContain("_id");
  });

  test("combinaison objet et Glossaire", () => {
    const données = { a: 1, b: 2, c: 3 };
    const glossaire = objet.glossaire(données);
    
    // Modifier via Glossaire
    glossaire.écrire("d", 4);
    glossaire.supprimer("a");
    
    // Reconvertir en objet
    const résultat = glossaire.objet();
    expect(résultat).toEqual({ b: 2, c: 3, d: 4 });
  });

  test("chaînage de méthodes définir", () => {
    const obj = {};
    
    const résultat = définir
      .immuable(obj, "constante1", 1)
      .muable(obj, "variable1", 2)
      .caché(obj, "secret1", 3);
    
    expect(résultat).toBe(définir);
    expect(obj.constante1).toBe(1);
    expect(obj.variable1).toBe(2);
    expect(obj.secret1).toBe(3);
  });
});

// ===== TESTS DE CAS LIMITES =====
describe("Cas limites et gestion d'erreurs", () => {
  test("propriétés avec noms spéciaux", () => {
    const obj = {};
    const nomsSpéciaux = ["constructor", "prototype", "__proto__", "toString", "valueOf"];
    
    nomsSpéciaux.forEach(nom => {
      expect(() => {
        définir.immuable(obj, nom, "test");
      }).not.toThrow();
    });
  });

  test("valeurs nulles et undefined", () => {
    const obj = {};
    
    définir.immuable(obj, "null", null);
    définir.immuable(obj, "undefined", undefined);
    
    expect(obj.null).toBeNull();
    expect(obj.undefined).toBeUndefined();
  });

  test("redéfinition de propriété non-configurable", () => {
    const obj = {};
    
    définir.immuable(obj, "nonConfig", 1, true, false);
    
    expect(() => {
      définir.immuable(obj, "nonConfig", 2, true, false);
    }).toThrow();
  });

  test("getters/setters avec erreurs", () => {
    const obj = {};
    
    définir.lu(obj, "erreurLecture", function() {
      throw new Error("Erreur de lecture");
    });
    
    définir.écrit(obj, "erreurÉcriture", function(val) {
      throw new Error("Erreur d'écriture");
    });
    
    expect(() => obj.erreurLecture).toThrow("Erreur de lecture");
    expect(() => { obj.erreurÉcriture = 1; }).toThrow("Erreur d'écriture");
  });

  test("Glossaire avec entrées invalides", () => {
    // Map accepte ces cas, donc Glossaire aussi
    const g1 = new Glossaire(null);
    expect(g1.size).toBe(0);
    
    const g2 = new Glossaire([]);
    expect(g2.size).toBe(0);
  });

  test("fonction objet.hérite sans comportements", () => {
    function Parent() {}
    function Enfant() {}
    
    expect(() => {
      objet.hérite(Enfant, Parent.prototype);
    }).not.toThrow();
    
    const instance = new Enfant();
    expect(instance.constructor).toBe(Enfant);
  });
});

// ===== TESTS DE PERFORMANCE =====
describe("Tests de performance", () => {
  test("définition de nombreuses propriétés", () => {
    const obj = {};
    const début = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      définir.muable(obj, `prop${i}`, i);
    }
    
    const durée = Date.now() - début;
    expect(durée).toBeLessThan(1000); // moins d'1 seconde
    expect(Object.keys(obj).length).toBe(1000);
  });

  test("performance Glossaire vs Map native", () => {
    const glossaire = new Glossaire();
    const map = new Map();
    const taille = 10000;
    
    // Test Glossaire
    const débutG = Date.now();
    for (let i = 0; i < taille; i++) {
      glossaire.écrire(`clé${i}`, i);
    }
    const duréeG = Date.now() - débutG;
    
    // Test Map native
    const débutM = Date.now();
    for (let i = 0; i < taille; i++) {
      map.set(`clé${i}`, i);
    }
    const duréeM = Date.now() - débutM;
    
    // Glossaire ne devrait pas être significativement plus lent
    // Éviter la division par zéro si les opérations sont très rapides
    if (duréeM > 0) {
      expect(duréeG / duréeM).toBeLessThan(5); // Plus tolérant pour les micro-benchmarks
    }
    expect(glossaire.taille).toBe(taille);
  });
});

// ===== TESTS DE COMPATIBILITÉ =====
describe("Tests de compatibilité", () => {
  test("interaction avec JSON", () => {
    const obj = {};
    définir.muable(obj, "visible", "sérialisable");
    définir.caché(obj, "caché", "non-sérialisable");
    
    const json = JSON.stringify(obj);
    const parsed = JSON.parse(json);
    
    expect(parsed).toEqual({ visible: "sérialisable" });
    expect(parsed).not.toHaveProperty("caché");
  });

  test("interaction avec Object.assign", () => {
    const source = {};
    définir.muable(source, "copiable", 1);
    définir.caché(source, "nonCopiable", 2);
    
    const cible = {};
    Object.assign(cible, source);
    
    expect(cible.copiable).toBe(1);
    expect(cible).not.toHaveProperty("nonCopiable");
  });

  test("interaction avec spread operator", () => {
    const obj = {};
    définir.muable(obj, "étalable", "oui");
    définir.caché(obj, "nonÉtalable", "non");
    
    const nouveau = { ...obj };
    
    expect(nouveau.étalable).toBe("oui");
    expect(nouveau).not.toHaveProperty("nonÉtalable");
  });

  test("interaction avec for...in et for...of", () => {
    const glossaire = new Glossaire([["a", 1], ["b", 2]]);
    
    const clésPourIn = [];
    for (let clé in glossaire) {
      clésPourIn.push(clé);
    }
    
    const entrées = [];
    for (let [clé, valeur] of glossaire) {
      entrées.push([clé, valeur]);
    }
    
    expect(entrées).toEqual([["a", 1], ["b", 2]]);
  });
});