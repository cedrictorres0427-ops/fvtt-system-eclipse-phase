/**
 * Eclipse Phase Actor — Foundry VTT v13
 *
 * COMPÉTENCES : TOTAL = APT_base + PP_investis + Morphe_compétence + Autres
 * APTITUDES   : Total = Base + Bonus Morphe + Bonus divers
 *
 * Jets d'aptitude avec multiplicateur (×1, ×2, ×3)
 * Jets de compétence avec spécialisation optionnelle
 */
import { EP_ROLL } from "../helpers/roll.js";

export class EclipsePhaseActor extends Actor {

  prepareDerivedData() {
    super.prepareDerivedData();
    const sys = this.system;
    if (!sys?.aptitudes) return;

    const apt = sys.aptitudes;
    const st  = sys.stats;
    if (!st) return;

    // ── Totaux aptitudes ──────────────────────────────────────
    for (const a of Object.values(apt)) {
      a.total = (a.base || 0) + (a.morphe || 0) + (a.divers || 0);
    }
    const get = (key) => apt[key]?.total || 0;

    // ── Initialise les objets stats manquants (PNJ, anciens acteurs) ──
    const init = (key, def) => { if (!st[key]) st[key] = { ...def }; };
    init("luc",          { value: 0, max: 0 });
    init("st",           { value: 0 });
    init("sa",           { value: 0 });
    init("aud",          { value: 5, max: 10, points: 5 });
    init("end",          { value: 30, max: 30, morphe: 0 });
    init("sb",           { value: 6 });
    init("sm",           { value: 45 });
    init("rap",          { value: 1, min: 1 });
    init("init",         { value: 4, effective: 4 });
    init("bd",           { value: 0 });
    init("blessures",    { value: 0 });
    init("traumas",      { value: 0 });
    init("stress",       { value: 0 });
    init("dommages",     { value: 0 });
    init("malus_actions",{ value: 0 });
    init("malus_init",   { value: 0 });

    // ── EGO ───────────────────────────────────────────────────
    const luc = get("vol") * 2;
    st.luc.value = luc;
    st.luc.max   = luc;
    st.st.value  = Math.ceil(luc / 5);
    st.sa.value  = luc * 2;
    st.aud.max = st.aud.value || 5;  // aud.value = max édité par le joueur (1-10)

    // ── MORPHE ────────────────────────────────────────────────
    const typeMorphe = sys.morphe_actuel?.type || "biomorphe";
    const end = (st.end.value || 30) + (st.end.morphe || 0);
    st.end.max  = end;
    st.sb.value = Math.ceil(end / 5);
    st.sm.value = typeMorphe === "synthomorphe" ? end * 2
                : typeMorphe === "infomorphe"   ? 0
                : Math.ceil(end * 1.5);
    st.rap.min  = typeMorphe === "synthomorphe" ? 3 : 1;

    // ── COMBAT ────────────────────────────────────────────────
    st.init.value     = Math.ceil((get("int") + get("ref")) / 5) + (sys.morphe_actuel?.bonus_init || 0);
    st.bd.value       = Math.floor(get("som") / 10);

    // ── MALUS blessures/traumas ───────────────────────────────
    const blessures = st.blessures.value || 0;
    const traumas   = st.traumas.value   || 0;
    st.malus_actions.value = (blessures + traumas) * 10;
    st.malus_init.value    = blessures + traumas;
    st.init.effective      = Math.max(0, st.init.value - (blessures + traumas));

    // ── Barres de token : dommages/END et stress/LUC ──────────
    st.dommages.max = st.end.max;
    st.stress.max   = st.luc.value;

    // ── COMPÉTENCES : APT.total + PP + Bonus ─────────────────
    const calcSkills = (obj) => {
      for (const sk of Object.values(obj || {})) {
        const aptTotal = apt[sk.aptitude]?.total || 0;
        sk.apt_value   = aptTotal;
        sk.total       = aptTotal + (sk.base || 0) + (sk.bonus_hist || 0) + (sk.bonus_morphe || 0);
      }
    };
    calcSkills(sys.competences_actives);
    calcSkills(sys.competences_connaissances);
  }

  // ── Jets compétence ─────────────────────────────────────────
  async rollSkill(skillKey, category = "actives", options = {}) {
    const sys    = this.system;
    const skills = category === "actives"
      ? sys.competences_actives
      : sys.competences_connaissances;
    const sk = skills?.[skillKey];
    if (!sk) { ui.notifications.warn("Compétence introuvable."); return; }

    return EP_ROLL.rollCompetence({
      actor:          this,
      skillNom:       sk.nom || sk.placeholder || skillKey,
      skillKey,
      target:         sk.total || 0,
      specialisation: sk.specialisation || "",
      malusBlessures: sys.stats?.malus_actions?.value || 0,
      showDamageBtn:  false,
      ...options,
    });
  }

  /**
   * Jet d'aptitude avec multiplicateur
   * @param {string} aptKey  - clé de l'aptitude (cog, coo…)
   * @param {number} multi   - multiplicateur (1, 2 ou 3)
   * @param {number} modif   - modificateur de difficulté
   */
  async rollAptitude(aptKey, multi = 1, modif = 0) {
    const apt = this.system.aptitudes?.[aptKey];
    if (!apt) return;

    const noms = {
      cog:"Cognition", coo:"Coordination", int:"Intuition",
      ref:"Réflexes",  ast:"Astuce",       som:"Somatique", vol:"Volonté"
    };
    const abrs = { cog:"COG", coo:"COO", int:"INT", ref:"RÉF", ast:"AST", som:"SOM", vol:"VOL" };

    const aptBase  = (apt.base || 0) + (apt.morphe || 0) + (apt.divers || 0);  // total aptitude (corps actuel)
    const target   = aptBase * multi;
    const malus    = this.system.stats?.malus_actions?.value || 0;

    return EP_ROLL.rollCompetence({
      actor:          this,
      skillNom:       `${noms[aptKey] || aptKey} ×${multi} (${abrs[aptKey]} ${aptBase} × ${multi} = ${target})`,
      skillKey:       aptKey,
      target,
      modificateur:   modif,
      malusBlessures: malus,
      showDamageBtn:  false,
    });
  }

  // ── Jets dommages ────────────────────────────────────────────
  async rollDamage(itemId) {
    const item = this.items.get(itemId);
    if (!item) return;

    const sys = item.system;
    const bd  = this.system.stats?.bd?.value || 0;

    let formule = sys.vd || "1d10";
    if (item.type === "arme_melee" && sys.vd_som) {
      formule = formule + " + " + bd;
    }

    const roll = new Roll(formule);
    await roll.evaluate();

    const pa  = sys.pa || 0;
    const esc = foundry.utils.escapeHTML;
    const flavor = `
<div class="ep-chat-roll">
  <div class="ep-roll-header">
    <span class="ep-actor-name">${esc(this.name)}</span>
    <span class="ep-skill-name">💥 Dommages — ${esc(item.name)}</span>
  </div>
  <div class="ep-roll-body">
    <div class="ep-roll-dice" style="font-size:22px;width:64px">${roll.total}</div>
    <div class="ep-roll-details">
      <div class="ep-roll-target">Formule : <b>${formule}</b></div>
      ${pa !== 0 ? `<div class="ep-roll-target">Pénétration d'Armure (PA) : <b>${pa > 0 ? "+" : ""}${pa}</b></div>` : ""}
      ${bd > 0 && item.type === "arme_melee" ? `<div class="ep-roll-target">BD inclus : <b>+${bd}</b></div>` : ""}
    </div>
  </div>
</div>`;

    const rollMode = game.settings.get("core", "rollMode");
    await roll.toMessage(
      { speaker: ChatMessage.getSpeaker({ actor: this }), flavor },
      { rollMode }
    );
  }

  // ── Audace / Dommages ────────────────────────────────────────
  async depenseAudace() {
    const esc = foundry.utils.escapeHTML;
    const pts = this.system.stats?.aud?.points || 0;
    if (pts <= 0) { ui.notifications.warn(`${this.name} n'a plus de points d'Audace !`); return; }
    await this.update({ "system.stats.aud.points": pts - 1 });
    ChatMessage.create({ content: `<div class="ep-chat-roll"><b>${esc(this.name)}</b> dépense 1 <b>Audace</b>. Reste : ${pts - 1}/${this.system.stats.aud.max}</div>`, speaker: ChatMessage.getSpeaker({ actor: this }) });
  }

  async regagneAudace(amount = 1) {
    const esc = foundry.utils.escapeHTML;
    const pts = this.system.stats?.aud?.points || 0;
    const max = this.system.stats?.aud?.max    || 5;
    const nv  = Math.min(pts + amount, max);
    await this.update({ "system.stats.aud.points": nv });
    ChatMessage.create({ content: `<div class="ep-chat-roll"><b>${esc(this.name)}</b> regagne <b>${amount}</b> Audace. Total : ${nv}/${max}</div>`, speaker: ChatMessage.getSpeaker({ actor: this }) });
  }

  async appliquerDommages(amount) {
    const esc = foundry.utils.escapeHTML;
    const cur = this.system.stats?.dommages?.value || 0;
    const sb  = this.system.stats?.sb?.value       || 6;
    const nv  = cur + amount;
    await this.update({ "system.stats.dommages.value": nv, "system.stats.blessures.value": Math.floor(nv / sb) });
    ChatMessage.create({ content: `<div class="ep-chat-roll"><b>${esc(this.name)}</b> reçoit <b>${amount}</b> dommages. Total : ${nv} / ${Math.floor(nv/sb)} blessure(s). Malus : −${Math.floor(nv/sb)*10}.</div>`, speaker: ChatMessage.getSpeaker({ actor: this }) });
  }

  async appliquerStress(amount) {
    const esc = foundry.utils.escapeHTML;
    const cur = this.system.stats?.stress?.value || 0;
    const st  = this.system.stats?.st?.value     || 4;
    const nv  = cur + amount;
    await this.update({ "system.stats.stress.value": nv, "system.stats.traumas.value": Math.floor(nv / st) });
    ChatMessage.create({ content: `<div class="ep-chat-roll"><b>${esc(this.name)}</b> subit <b>${amount}</b> stress. Total : ${nv} / ${Math.floor(nv/st)} trauma(s). Malus : −${Math.floor(nv/st)*10}.</div>`, speaker: ChatMessage.getSpeaker({ actor: this }) });
  }
}
