export declare namespace définir {
  export function muable(cible: any, nom: PropertyKey, initiale: any|undefined, visible?: boolean, configurable?: boolean);
  export function immuable(cible: any, nom: PropertyKey, constante: any, visible?: boolean, configurable?: boolean);
  export function lu(cible: any, nom: PropertyKey, accès: () => any, visible?: boolean, configurable?: boolean);
  export function écrit(cible: any, nom: PropertyKey, assignation: (valeur: any) => void, visible?: boolean, configurable?: boolean);
  export function propre(cible: any, nom: PropertyKey, accès: () => any, assignation: (valeur: any) => void, visible?: boolean, configurable?: boolean);
  export function caché(cible: any, nom: PropertyKey, initiale: any, configurable?: boolean);
}

export declare interface Glossaire<Entrée,Article> extends Map<Entrée,Article> {
  readonly taille: number;
  vider(): void;
  supprimer(entrée: Entrée): boolean;
  itérer(délégué: (entrée: Entrée, article: Article, glossaire: Glossaire<Entrée,Article>) => void, thisArg?: any): void;
  lire(entrée: Entrée): Article | undefined;
  a(entrée: Entrée): boolean;
  écrire(entrée: Entrée, article: Article): this;
}

interface GlossaireConstructor {
  new (): Glossaire<any, any>;
  new <Entrée,Article>(entries?: readonly (readonly [Entrée, Article])[] | null): Glossaire<Entrée,Article>;
  readonly prototype: Glossaire<any, any>;
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

export default définir;