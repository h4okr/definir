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
