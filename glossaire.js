export default class Glossaire extends Map {
  constructor(...entrées) {
    super(...entrées);
  }
  get taille() {
    return this.size;
  }
  objet(prototype) {
    return Object.fromEntries(this);
  }
  vider = this.clear;
  supprimer = this.delete;
  itérer(délégué, sujet) {
    this.forEach(délégué, sujet ?? this);
  }
  lire = this.get;
  a = this.has;
  écrire = this.set;
}