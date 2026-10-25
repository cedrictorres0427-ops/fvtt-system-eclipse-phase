/**
 * Eclipse Phase Item — Foundry VTT v13
 */
export class EclipsePhaseItem extends Item {

  async _onCreate(data, options, userId) {
    await super._onCreate(data, options, userId);
    // Garde multi-clients : seul le client à l'origine de la création applique les bonus,
    // sinon chaque client connecté exécuterait les updates/suppressions en double.
    if (userId !== game.user.id) return;
    if (this.type === "morphe" && this.actor) {
      await this._applyMorpheBonuses();
    }
  }

  async _applyMorpheBonuses() {
    const actor = this.actor;
    if (!actor) return;
    const m = this.system;

    // ── 1. Supprimer tous les autres morphes de la fiche ──────────
    // (on ne garde que le nouveau — changer de morphe = changer TOTALEMENT de corps)
    const autresMorphes = actor.items.filter(i => i.type === "morphe" && i.id !== this.id);
    for (const ancien of autresMorphes) {
      await ancien.delete();
    }

    // ── 2. Remettre TOUS les bonus morphe d'aptitudes à 0 d'abord ─
    const resetAptitudes = {};
    for (const k of ["cog", "coo", "int", "ref", "ast", "som", "vol"]) {
      resetAptitudes[`system.aptitudes.${k}.morphe`] = 0;
    }
    await actor.update(resetAptitudes);

    // ── 3. Appliquer les nouveaux bonus du morphe ─────────────────
    const updates = {};

    // Bonus d'aptitudes
    for (const [k, bonus] of Object.entries(m.aptitudes_bonus || {})) {
      updates[`system.aptitudes.${k}.morphe`] = Number(bonus) || 0;
    }

    // Mapper le type spécifique vers la catégorie générale utilisée dans les formules
    const SYNTHO_TYPES = new Set([
      "chassis","synth","arachnoide","libellule","flexbot","faucheur",
      "slitheroid","gargoyle","swarmanoid","savant","fenrir","synthomorphe"
    ]);
    const INFO_TYPES = new Set(["infomorphe","muse"]);
    const POD_TYPES  = new Set([
      "cosse_plaisir","cosse_ouvriere","cosse_securite","cosse_specialiste",
      "cosse_sous_vide","basic_pod","ripwing","ayah","novacrabbe_pod"
    ]);

    const typeGenerique = INFO_TYPES.has(m.type_morphe) ? "infomorphe"
                        : SYNTHO_TYPES.has(m.type_morphe) ? "synthomorphe"
                        : POD_TYPES.has(m.type_morphe)    ? "pod"
                        : "biomorphe";

    // Stats du morphe
    updates["system.stats.end.value"]  = m.endurance || 30;
    updates["system.stats.end.morphe"] = 0;
    if (m.modif_rapidite !== undefined && m.modif_rapidite !== null) {
      const rapBase = (typeGenerique === "synthomorphe") ? 3 : 1;
      updates["system.stats.rap.value"] = rapBase + (Number(m.modif_rapidite) || 0);
    }

    // Infos morphe actuel
    updates["system.morphe_actuel.nom"]  = this.name;
    updates["system.morphe_actuel.type"] = typeGenerique;   // catégorie générale pour les formules
    updates["system.morphe_actuel.description"]  = m.description   || "";
    updates["system.morphe_actuel.implants"]     = m.implants      || "";
    updates["system.morphe_actuel.avantages"]    = m.avantages     || "";
    updates["system.morphe_actuel.desavantages"] = m.desavantages  || "";
    updates["system.morphe_actuel.mobilite"]     = m.mobilite || m.deplacement || "";
    updates["system.morphe_actuel.armure"]       = m.armure        || "";
    updates["system.morphe_actuel.notes"]        = [m.aspects, m.notes].filter(Boolean).join(" · ");
    updates["system.morphe_actuel.bonus_init"]   = Number(m.bonus_init) || 0;
    updates["system.morphe_actuel.image_echelle"] = m.image_echelle || "";

    // Avatar : l'image du morphe devient le portrait du personnage
    // (sauf si le morphe garde l'icône par défaut des items)
    if (this.img && this.img !== "icons/svg/item-bag.svg") {
      updates["img"] = this.img;
    }

    // Armure intrinsèque du morphe (ex: "8/8" → Énergie 8 / Cinétique 8),
    // à laquelle s'ajoutent les armures portées (items) déjà sur la fiche.
    const [intrE, intrC] = ((m.armure || "").match(/\d+/g) || []).map(Number);
    const armuresPortees = actor.items.filter(i => i.type === "armure_item");
    const porteeE = armuresPortees.reduce((s, i) => s + (i.system.ca_energie   || 0), 0);
    const porteeC = armuresPortees.reduce((s, i) => s + (i.system.ca_cinetique || 0), 0);
    updates["system.armure.energie"]   = (intrE || 0) + porteeE;
    updates["system.armure.cinetique"] = (intrC ?? intrE ?? 0) + porteeC;

    if (Object.keys(updates).length) await actor.update(updates);

    // Notification
    ui.notifications.info(
      `Morphe « ${this.name} » appliqué à ${actor.name}. Tous les anciens bonus morphe ont été remplacés.`
    );
  }
}
