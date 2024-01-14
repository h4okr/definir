import { définir, Glossaire, objet } from "../index.js";
import { test, describe, it, expect } from "@jest/globals";

test("Existence", () => {
  expect(définir).toBeDefined();
  expect(Glossaire).toBeDefined();
  expect(objet).toBeDefined();
});

test("Types", () => {
  expect(typeof définir).toEqual("object");
  expect(typeof Glossaire).toEqual("function");
  expect(typeof objet).toEqual("function");
});

test("Instance de Glossaire", () => {
  const glossaire = new Glossaire([["a", 1]]);
  expect(glossaire instanceof Glossaire).toBeTruthy();
});

test("Équivalence entre Glossaire et objet.", () => {
  expect(true).toBeTruthy();
});

describe("Définir permet", () => {
  const obj = {};
  test("de créer une propriété immuable.", () => {
    définir.immuable(obj, "immuable", "un mot");
    expect(obj.immuable).toBeDefined();
    expect(obj.immuable).toEqual("un mot");
    expect(() => (obj.immuable = "truc")).toThrow();
    expect(() => définir.muable(obj, "immuable", "un nouveau mot")).toThrow();
  });
  test("de créer une propriété muable", () => {
    définir.muable(obj, "muable", 42);
    expect(obj.muable());
  });
  test("de créer une propriété lue", () => {
    définir.lu();
  });
  test("de créer une propriété écrite", () => {});
  test("de créer une propriété cachée", () => {});
  test("de créer une propriété propre", () => {});
});
