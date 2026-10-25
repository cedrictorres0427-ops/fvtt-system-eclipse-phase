/**
 * Eclipse Phase NPC Sheet — Fiche PNJ simplifiée — Foundry VTT v13
 *
 * Compétences via drag & drop d'items "competence"
 * Jets d'aptitude avec dialogue multiplicateur (×1 / ×2 / ×3)
 * Bouton dommages directement sur la fiche (pas via le chat)
 */
import { EP_ROLL } from "../helpers/roll.js";
import { coutItem } from "../item/item-sheet.js";

export class EclipsePhaseNPCSheet extends ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:  ["eclipse-phase", "sheet", "actor", "npc"],
      template: "systems/eclipse-phase/templates/actor/npc-sheet.html",
      width: 650, height: 620,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }],
    });
  }

  get template() { return "systems/eclipse-phase/templates/actor/npc-sheet.html"; }

  getData() {
    const ctx = super.getData();
    const sys = this.actor.system;
    const aptAbrs = { cog:"COG", coo:"COO", int:"INT", ref:"RÉF", ast:"AST", som:"SOM", vol:"VOL" };

    ctx.aptitudes = {};
    for (const [k, a] of Object.entries(sys.aptitudes || {})) {
      ctx.aptitudes[k] = { ...a, key: k, total: (a.base||0) + (a.morphe||0) };
    }

    ctx.stats         = sys.stats        || {};
    ctx.armure        = sys.armure       || {};
    ctx.biographie    = sys.biographie   || {};
    ctx.morphe_actuel = sys.morphe_actuel|| {};

    // Items — exposer id explicitement (les getters Foundry ne se spreadent pas via ...)
    ctx.competences_items = this.actor.items
      .filter(i => i.type === "competence")
      .map(item => {
        const apt      = ctx.aptitudes[item.system.aptitude];
        // Total de l'aptitude (base + morphe), cohérent avec les jets d'aptitude
        const aptBase  = apt?.total || 0;
        const val      = item.system.valeur || 0;
        return {
          id:      item.id,
          img:     item.img,
          name:    item.name,
          system:  item.system,
          _total:  aptBase + val,  // val = PP investis. Autres_bonus ajouté au jet seulement
          _aptAbr: aptAbrs[item.system.aptitude] || "?",
          _aptVal: aptBase,
        };
      });

    ctx.armes_items = this.actor.items
      .filter(i => i.type === "arme_melee" || i.type === "arme_distance")
      .map(i => ({ id: i.id, img: i.img, name: i.name, type: i.type, system: i.system, cout: coutItem(i.system) }));

    ctx.equip_items = this.actor.items
      .filter(i => i.type === "equipement")
      .map(i => ({ id: i.id, img: i.img, name: i.name, system: i.system, cout: coutItem(i.system) }));

    ctx.armures_items = this.actor.items
      .filter(i => i.type === "armure_item")
      .map(i => ({ id: i.id, img: i.img, name: i.name, system: i.system, cout: coutItem(i.system) }));

    ctx.isGM = game.user.isGM;
    return ctx;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Mise à jour inline des valeurs de compétences
    html.find(".ep-item-field").on("change", async ev => {
      const itemId = ev.currentTarget.dataset.itemId;
      const field  = ev.currentTarget.dataset.field;
      const value  = Number(ev.currentTarget.value) || 0;
      const item   = this.actor.items.get(itemId);
      if (item && field) await item.update({ [field]: value });
    });

    // Jets de compétence PNJ
    html.find(".skill-roll-npc").on("click", ev => this._onRollNPCSkill(ev));

    // Jets d'aptitude avec multiplicateur
    html.find(".apt-roll").on("click", ev => this._onRollAptitude(ev));

    // Bouton dommages direct sur la fiche
    html.find(".item-roll-dmg").on("click", ev => this._onItemRollDamage(ev));

    // Items
    html.find(".item-edit").on("click", ev => {
      const id = ev.currentTarget.closest("[data-item-id]")?.dataset.itemId;
      this.actor.items.get(id)?.sheet.render(true);
    });
    html.find(".item-delete").on("click", async ev => {
      const id   = ev.currentTarget.closest("[data-item-id]")?.dataset.itemId;
      const item = this.actor.items.get(id);
      if (item && await Dialog.confirm({ title: "Supprimer", content: `Supprimer <b>${item.name}</b> ?` })) await item.delete();
    });

    html.find(".btn-dmg-apply").on("click", () => this._onApplyDamage());
    html.find(".aud-spend").on("click",   () => this.actor.depenseAudace?.());
    html.find(".aud-recover").on("click", () => this.actor.regagneAudace?.(1));
  }

  // ── Jet compétence PNJ ──────────────────────────────────────
  async _onRollNPCSkill(ev) {
    ev.preventDefault();
    const id   = ev.currentTarget.closest("[data-item-id]")?.dataset.itemId;
    const item = this.actor.items.get(id);
    if (!item) return;

    const apt      = this.actor.system.aptitudes?.[item.system.aptitude];
    // Total de l'aptitude (base + morphe), cohérent avec les jets d'aptitude
    const aptBase  = (apt?.base || 0) + (apt?.morphe || 0);
    const total    = aptBase + (item.system.valeur || 0);  // autres_bonus via option dans le dialogue
    const malus    = this.actor.system.stats?.malus_actions?.value || 0;
    const spec     = item.system.specialisation || "";
    const esc      = (foundry.utils.escapeHTML ?? Handlebars.escapeExpression);

    // Dialogue simple : difficulté + spécialisation optionnelle
    const specHTML = spec ? `
      <div class="form-group" style="margin-top:6px;padding:5px 8px;background:rgba(58,128,200,0.08);border:1px solid rgba(58,128,200,0.3);border-radius:4px">
        <label><input type="checkbox" name="spec" /> Appliquer spécialisation : <em>${esc(spec)}</em> (+10)</label>
      </div>` : "";

    return new Promise(r => {
      new Dialog({
        title: `Jet PNJ : ${item.name}`,
        content: `<form>
          <p style="font-size:11px;color:#8898bc;margin-bottom:8px">
            APT base : <b>${aptBase}</b> + PP : <b>${item.system.valeur||0}</b> = <b>${total}</b>
            ${malus ? `<br><span style="color:#e08080">Malus : −${malus}</span>` : ""}
          </p>
          <div class="form-group"><label>Difficulté :</label>
            <select name="modif">
              <option value="30">Sans effort (+30)</option>
              <option value="20">Simple (+20)</option>
              <option value="10">Facile (+10)</option>
              <option value="0" selected>Moyen (±0)</option>
              <option value="-10">Difficile (−10)</option>
              <option value="-20">Défi (−20)</option>
              <option value="-30">Expert (−30)</option>
            </select></div>
          ${specHTML}</form>`,
        buttons: {
          roll: { label: "🎲 Lancer", callback: async html => {
            const modif   = parseInt(html.find("[name='modif']").val()) || 0;
            const useSpec = html.find("[name='spec']").is(":checked");
            await EP_ROLL.rollCompetence({
              actor: this.actor,
              skillNom: item.name + (useSpec ? ` [spéc: ${spec}]` : ""),
              skillKey: id, target: total,
              modificateur: modif,
              specialisation: spec,
              useSpecialisation: useSpec,
              malusBlessures: malus,
              showDamageBtn: false,
            });
            r();
          }},
          cancel: { label: "Annuler", callback: () => r() },
        },
        default: "roll",
      }).render(true);
    });
  }

  // ── Jet d'aptitude avec multiplicateur ─────────────────────
  async _onRollAptitude(ev) {
    ev.preventDefault();
    const aptKey = ev.currentTarget.dataset.aptKey;
    if (!aptKey) return;

    const apt    = this.actor.system.aptitudes?.[aptKey];
    const aptBase= (apt?.base || 0) + (apt?.morphe || 0);  // total aptitude (corps actuel)
    const malus  = this.actor.system.stats?.malus_actions?.value || 0;
    const abrs   = { cog:"COG", coo:"COO", int:"INT", ref:"RÉF", ast:"AST", som:"SOM", vol:"VOL" };
    const noms   = { cog:"Cognition", coo:"Coordination", int:"Intuition", ref:"Réflexes", ast:"Astuce", som:"Somatique", vol:"Volonté" };
    const abr    = abrs[aptKey] || aptKey.toUpperCase();

    return new Promise(r => {
      new Dialog({
        title: `Test d'Aptitude PNJ : ${noms[aptKey] || aptKey}`,
        content: `<form>
          <p style="font-size:12px;color:#8898bc;margin-bottom:8px">
            ${abr} base : <b>${aptBase}</b>
            ${malus ? `<br><span style="color:#e08080">Malus : −${malus}</span>` : ""}
          </p>
          <div class="form-group"><label>Multiplicateur :</label>
            <select name="multi">
              <option value="1">${abr} × 1 = ${aptBase}</option>
              <option value="2" selected>${abr} × 2 = ${aptBase * 2}</option>
              <option value="3">${abr} × 3 = ${aptBase * 3}</option>
            </select></div>
          <div class="form-group"><label>Difficulté :</label>
            <select name="modif">
              <option value="30">Sans effort (+30)</option>
              <option value="20">Simple (+20)</option>
              <option value="10">Facile (+10)</option>
              <option value="0" selected>Moyen (±0)</option>
              <option value="-10">Difficile (−10)</option>
              <option value="-20">Défi (−20)</option>
              <option value="-30">Expert (−30)</option>
            </select></div></form>`,
        buttons: {
          roll: { label: "🎲 Lancer", callback: async html => {
            const multi = parseInt(html.find("[name='multi']").val()) || 1;
            const modif = parseInt(html.find("[name='modif']").val()) || 0;
            await this.actor.rollAptitude(aptKey, multi, modif);
            r();
          }},
          cancel: { label: "Annuler", callback: () => r() },
        },
        default: "roll",
      }).render(true);
    });
  }

  // ── Dommages direct depuis la fiche PNJ ─────────────────────
  async _onItemRollDamage(ev) {
    ev.preventDefault();
    const id   = ev.currentTarget.closest("[data-item-id]")?.dataset.itemId;
    if (id) await this.actor.rollDamage(id);
  }

  async _onApplyDamage() {
    const sys = this.actor.system.stats;
    new Dialog({
      title: `Dommages — ${this.actor.name}`,
      content: `<form>
        <div class="form-group"><label>Quantité :</label><input type="number" name="qty" value="0" min="0" style="width:72px" /></div>
        <div class="form-group"><label>Type :</label>
          <select name="type">
            <option value="dmg">Dommages physiques</option>
            <option value="soins">Soins</option>
          </select></div></form>`,
      buttons: { ok: { label: "Appliquer", callback: async html => {
        const qty  = parseInt(html.find("[name='qty']").val()) || 0;
        const type = html.find("[name='type']").val();
        if (type === "dmg") await this.actor.appliquerDommages?.(qty);
        else {
          const cur = sys?.dommages?.value || 0;
          const sb  = sys?.sb?.value || 6;
          const nv  = Math.max(0, cur - qty);
          await this.actor.update({ "system.stats.dommages.value": nv, "system.stats.blessures.value": Math.floor(nv/sb) });
        }
      }}},
      default: "ok",
    }).render(true);
  }

  _getSubmitData(updateData = {}) {
    const data = super._getSubmitData(updateData);
    for (const [k, v] of Object.entries(data)) {
      if (Array.isArray(v)) { const ne = v.filter(x => x !== "" && x !== null); data[k] = ne.length ? ne[ne.length-1] : (v[0]??""); }
    }
    return data;
  }
}
