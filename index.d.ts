export function définir<any>(o: any, p: PropertyKey, attributes: PropertyDescriptor & ThisType<any>): any;

export declare namespace définir {
  export function muable(cible: any, nom: PropertyKey, initiale: any|undefined, énumérable?: boolean, configurable?: boolean): définir;
  export function immuable(cible: any, nom: PropertyKey, constante: any, énumérable?: boolean, configurable?: boolean): définir;
  export function lu(cible: any, nom: PropertyKey, accès: () => any, énumérable?: boolean, configurable?: boolean): définir;
  export function écrit(cible: any, nom: PropertyKey, assignation: (valeur: any) => void, énumérable?: boolean, configurable?: boolean): définir;
  export function propre(cible: any, nom: PropertyKey, accès: () => any, assignation: (valeur: any) => void, énumérable?: boolean, configurable?: boolean): définir;
  export function caché(cible: any, nom: PropertyKey, initiale: any, configurable?: boolean): définir;
}

export class Glossaire<Entrée,Article> extends Map<Entrée,Article> {
  constructor<Entrée,Article>(définitions?: readonly (readonly [Entrée, Article])[] | null): Glossaire<Entrée,Article>;
  readonly taille: number;
  vider(): void;
  supprimer(entrée: Entrée): boolean;
  itérer(délégué: (entrée: Entrée, article: Article, glossaire: Glossaire<Entrée,Article>) => void, thisArg?: any): void;
  lire(entrée: Entrée): Article | undefined;
  a(entrée: Entrée): boolean;
  écrire(entrée: Entrée, article: Article): this;
  /**
   * Créé un objet avec des propriétés ayant pour nom les entrées de ce glossaire
   * valorisées avec les articles.
   */
  objet(): {};
}

export declare const Glossaire: GlossaireConstructor;

export declare namespace objet {
  const fusion: (cible: object, ...compléments: any[]) => any;
  const constructeur: (fabrique: Function) => PropertyDescriptorMap;
  const hérite: (fabrique: Function, superConstructeur: object, comportement: PropertyDescriptorMap) => void;
  const propriétés: (objet: object) => string[];
  const entrées: (objet: object) => [string, any][];
  const glossaire: (objet: object) => Glossaire<string, any>;
}

export function objet(prototype: object|null, propriétés: PropertyDescriptorMap): any;

export default {
  définir,
  Glossaire,
  objet
}