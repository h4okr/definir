export declare function muable(cible: any, nom: PropertyKey, initiale?: any, visible: boolean = true, configurable: boolean = false);
export declare function immuable(cible: any, nom: PropertyKey, constante: any, visible: boolean = true, configurable: boolean = false);
export declare function lu(cible: any, nom: PropertyKey, accès: () => any, visible: boolean = true, configurable: boolean = false);
export declare function écrit(cible: any, nom: PropertyKey, assignation: (valeur: any) => void, visible: boolean = true, configurable: boolean = false);
export declare function propre(cible: any, nom: PropertyKey, accès: () => any, assignation: (valeur: any) => void, visible: boolean = true, configurable: boolean = false);
export declare function caché(cible: any, nom: PropertyKey, initiale: any, configurable: boolean = false);

export declare namespace définir {
  muable,
  immuable,
  lu,
  écrit,
  propre,
  caché
}

export declare class Glossaire<Entrée,Article> extends Map<Entrée,Article> {
  readonly taille: number;
  vider(): void;
  supprimer(entrée: Entrée): boolean;
  itérer(délégué: (entrée: Entrée, article: Article, glossaire: Glossaire<K, V>) => void, thisArg?: any): void;
  lire(entrée: Entrée): Article | undefined;
  a(entrée: Entrée): boolean;
  écrire(entrée: Entrée, article: Article): this;
}

export declare const Glossaire: MapConstructor;

export declare namespace objet {
  const fusion: (cible: object, ...compléments: any[]) => any;
  const constructeur: (fabrique: Function) => PropertyDescriptorMap;
  const hérite: (fabrique: Function, superConstructeur: object, comportement: PropertyDescriptorMap) => void;
  const propriétés: (objet: object) => string[];
  const entrées: (objet: object) => [string, any][];
  const glossaire: (objet: abject) => Glossaire<string, any>;
}


export default définir;