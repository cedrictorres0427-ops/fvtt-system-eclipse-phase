/**
 * Eclipse Phase ItemSheet — Foundry VTT v13
 * Templates séparés par type d'item
 */
/**
 * Catégories de prix officielles (Équipement, p. 295).
 * moyen = prix moyen conseillé ; min/max = fourchette de la catégorie.
 */
export const EP_COUTS = {
  gratuit: { label: "Gratuit",  moyen: 0,     texte: "—" },
  modique: { label: "Modique",  moyen: 50,    texte: "1 à 99 cr." },
  bas:     { label: "Bas",      moyen: 250,   texte: "100 à 499 cr." },
  moyen:   { label: "Moyen",    moyen: 1000,  texte: "500 à 1 499 cr." },
  eleve:   { label: "Élevé",    moyen: 5000,  texte: "1 500 à 9 999 cr." },
  onereux: { label: "Onéreux",  moyen: 20000, texte: "10 000 cr. et +" },
};
const nbr = (n) => new Intl.NumberFormat("fr-FR").format(n);

/** Libellé de prix d'un item : prix exact si saisi, sinon prix moyen de la catégorie. */
export function coutItem(sys = {}) {
  const cat = EP_COUTS[sys.cout];
  const exact = String(sys.cout_credits ?? "").trim();
  const notes = String(sys.cout_notes ?? "").trim();
  let base;
  if (exact) base = /^\d+$/.test(exact) ? `${nbr(Number(exact))} cr.` : exact;
  else if (cat) base = cat.moyen ? `${nbr(cat.moyen)} cr. (${cat.label})` : cat.label;
  else base = "prix non défini";
  return notes ? `${base} — ${notes}` : base;
}

export class EclipsePhaseItemSheet extends ItemSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["eclipse-phase", "sheet", "item"],
      width:   560, height: 480,
    });
  }

  get template() {
    const tpls = {
      morphe:      "systems/eclipse-phase/templates/item/morphe-sheet.html",
      equipement:  "systems/eclipse-phase/templates/item/equipment-sheet.html",
      aspect:      "systems/eclipse-phase/templates/item/aspect-sheet.html",
      passe_psi:   "systems/eclipse-phase/templates/item/passe-psi-sheet.html",
      arme_melee:  "systems/eclipse-phase/templates/item/arme-melee-sheet.html",
      arme_distance:"systems/eclipse-phase/templates/item/arme-distance-sheet.html",
      armure_item: "systems/eclipse-phase/templates/item/armure-item-sheet.html",
      competence:  "systems/eclipse-phase/templates/item/competence-sheet.html",
    };
    return tpls[this.item.type] ?? tpls.equipement;
  }

  getData() {
    const ctx = super.getData();
    ctx.system   = this.item.system;
    ctx.itemType = this.item.type;
    // Vignette d'échelle du morphe : placeholder si aucune image définie
    ctx.imageEchelle = this.item.system.image_echelle || "icons/svg/mystery-man.svg";
    // Passes psi : mode actif/passif indépendant du niveau Chi/Gamma.
    // Si non renseigné (anciennes passes), repli sur l'ancienne convention Chi→passif, Gamma→actif.
    ctx.activationEffective = this.item.system.activation
      || (this.item.system.type_psi === "gamma" ? "actif" : "passif");
    // Prix : libellé calculé + placeholder du prix moyen de la catégorie
    ctx.coutAffiche = coutItem(this.item.system);
    ctx.coutMoyen   = EP_COUTS[this.item.system.cout]?.moyen || "";
    return ctx;
  }

  activateListeners(html) { super.activateListeners(html); }
}
