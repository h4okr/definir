class Glossaire extends Map {
  constructor(...entrées) {
    super(...entrées);
  }
  objet() {
    return Glossaire.objet(this);
  }
}

Glossaire.objet = Object.fromEntries;

module.exports = Glossaire;