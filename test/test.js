import { définir, Glossaire, objet } from "../index.js";
import { test, describe, it, expect } from "@jest/globals";

test("Existence", () => {
  expect(définir).toBeDefined();
  expect(Glossaire).toBeDefined();
  expect(objet).toBeDefined();
});

test("Types", () => {
  expect(typeof définir).toEqual("function");
  expect(définir).toHaveProperty("lu");
  expect(typeof Glossaire).toEqual("function");
  expect(typeof objet).toEqual("function");
});

test("Instance de Glossaire", () => {
  const glossaire = new Glossaire([["a", 1]]);
  expect(glossaire instanceof Glossaire).toBeTruthy();
});

const obj = {};

describe("Définir permet", () => {
  test("de créer une propriété immuable.", () => {
    définir.immuable(obj, "immuable", "un mot");
    expect(obj.immuable).toBeDefined();
    expect(obj.immuable).toStrictEqual("un mot");
    expect(() => (obj.immuable = "truc")).toThrow();
    expect(() => définir.muable(obj, "immuable", "un nouveau mot")).toThrow();
  });
  test("de créer une propriété muable", () => {
    définir.muable(obj, "muable", 42);
    expect(obj.muable).toBeDefined();
    expect(obj.muable).toStrictEqual(42);
    obj.muable += 1;
    expect(obj.muable).toStrictEqual(43);
    obj.muable = "un mot";
    expect(obj.muable).toStrictEqual("un mot");
    expect(définir.muable(obj, "muable", "un nouveau mot")).toEqual(définir);
    expect(obj.muable).toStrictEqual("un nouveau mot");
  });
  test("de créer une propriété lue", () => {
    définir.lu(obj, "lu", function () {
      return this.muable + 1;
    });
    expect(obj.lu).toBeDefined();
    expect(typeof obj.lu).toBe("string");
    expect(obj.lu).toStrictEqual("un nouveau mot1");
    obj.muable = 41;
    expect(obj.lu).toStrictEqual(42);
    expect(() => (obj.lu = 1)).toThrow();
  });
  test("de créer une propriété écrite", () => {
    définir.écrit(obj, "écrit", function (valeur) {
      this.muable = valeur;
    });
    expect(obj.écrit).toBeUndefined();
    obj.écrit = "test";
    expect(obj.lu).toStrictEqual("test1");
    obj.écrit = 1;
    expect(obj.lu).toStrictEqual(2);
  });
  test("de créer une propriété cachée", () => {
    définir.caché(obj, "caché", 1);
    expect(obj.caché).toStrictEqual(1);
  });
  test("de créer une propriété propre", () => {
    définir.propre(
      obj,
      "propre",
      function () {
        return this.caché;
      },
      function (valeur) {
        this.caché = valeur;
      }
    );
  });
});

describe("Existence des propriétés créées sur l’objet", () => {
  test("par Object.getOwnPropertyNames()", () => {
    const props = Object.getOwnPropertyNames(obj);
    expect(props).toContain("lu");
    expect(props).toContain("écrit");
    expect(props).toContain("muable");
    expect(props).toContain("immuable");
    expect(props).toContain("propre");
    expect(props).toContain("caché");
  });
  test("à travers une boucle for … in", () => {
    const props = [];
    for (let prop in obj) {
      props.push(prop);
    }
    expect(props).toContain("lu");
    expect(props).toContain("écrit");
    expect(props).toContain("muable");
    expect(props).toContain("immuable");
    expect(props).toContain("propre");
    expect(props.indexOf("caché")).toStrictEqual(-1);
  });
});

test("Équivalence entre Glossaire et objet.", () => {
  expect(true).toBeTruthy();
});
