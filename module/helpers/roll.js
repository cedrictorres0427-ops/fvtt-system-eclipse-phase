/**
 * Eclipse Phase — Moteur de jets d100 — Foundry VTT v13
 *
 * Formule correcte : TOTAL = APT + Base (PP) + Morphe + Autres
 * La spécialisation +10 est appliquée au jet via le dialogue
 * Malus blessures/traumas réduit le seuil
 */
export class EP_ROLL {

  static async rollD100() {
    const roll = new Roll("1d100");
    await roll.evaluate();
    const raw   = roll.total;
    const value = raw === 100 ? 0 : raw;
    return { roll, raw, value };
  }

  static isDouble(v) {
    if (v === 0) return true;
    return Math.floor(v / 10) === v % 10;
  }
  static fmt(v) { return String(v).padStart(2, "0"); }

  /**
   * Jet de compétence principal
   * target = APT + Base + Morphe + Autres  (déjà calculé dans actor.js)
   * Le modificateur de difficulté s'ajoute au seuil
   * Le malus blessures/traumas se soustrait du seuil
   * La spécialisation +10 s'ajoute si cochée
   */
  static async rollCompetence(options = {}) {
    const {
      actor,
      skillNom        = "Compétence",
      skillKey        = "",
      target          = 0,      // TOTAL pré-calculé (APT + Base + Morphe + Autres)
      modificateur    = 0,      // modificateur de difficulté
      specialisation  = "",
      useSpecialisation = false,
      parDefaut       = false,  // jet sur l'aptitude seule (sans PP investis)
      malusBlessures  = 0,      // malus blessures+traumas (soustrait du seuil)
      showDamageBtn   = false,  // afficher bouton dommages en cas de réussite
    } = options;

    // Seuil effectif
    let seuil = target + modificateur;
    if (useSpecialisation && specialisation) seuil += 10;
    seuil -= malusBlessures;

    const { roll, value } = await EP_ROLL.rollD100();
    // Réglage monde : les jets doubles (11, 22, 33…) comptent-ils comme critiques ?
    const critiquesDoubles = game.settings.get("eclipse-phase", "critiquesDoubles");
    const isDouble = critiquesDoubles && EP_ROLL.isDouble(value);

    let isReussite = false, isEchec = false;
    let isCrit = false, isCritR = false, isCritE = false;
    let mr = 0, me = 0, isExcep = false, isCuisant = false;

    if (value === 0) {
      isReussite = true; isCrit = true; isCritR = true; mr = 0;
    } else if (value === 99) {
      isEchec = true; isCrit = true; isCritE = true; me = Math.max(0, 99 - seuil);
    } else if (value <= seuil) {
      isReussite = true; mr = value;
      if (isDouble) { isCrit = true; isCritR = true; }
      if (mr >= 30) isExcep = true;
    } else {
      isEchec = true; me = value - seuil;
      if (isDouble) { isCrit = true; isCritE = true; }
      if (me >= 30) isCuisant = true;
    }

    let resClass = isReussite ? "ep-reussite" : "ep-echec";
    if (isCritR) resClass += " ep-critique-reussite";
    if (isCritE) resClass += " ep-critique-echec";

    let resText;
    if (isCritR)        resText = "✨ RÉUSSITE CRITIQUE !";
    else if (isExcep)   resText = `⭐ Réussite Exceptionnelle (MR ${mr})`;
    else if (isReussite) resText = `✅ Réussite (MR ${mr})`;
    else if (isCritE)   resText = "💥 ÉCHEC CRITIQUE !";
    else if (isCuisant) resText = `❌ Échec Cuisant (ME ${me})`;
    else                resText = `❌ Échec (ME ${me})`;

    // Détail des modificateurs (données utilisateur échappées)
    const esc = foundry.utils.escapeHTML;
    const modParts = [];
    if (modificateur !== 0)               modParts.push(`difficulté ${modificateur > 0 ? "+" : ""}${modificateur}`);
    if (useSpecialisation && specialisation) modParts.push(`spéc. +10 : ${esc(specialisation)}`);
    if (malusBlessures > 0)               modParts.push(`malus −${malusBlessures}`);
    if (parDefaut)                         modParts.push("par défaut (aptitude seule)");
    const modInfo = modParts.length ? ` [${modParts.join(" | ")}]` : "";

    // Bouton dommages (si réussite + compétence d'attaque)
    const actorId = actor?.id || "";
    // Bouton dommages : utilise data-actor-id + hook renderChatMessage (pas onclick= bloqué par Foundry v13)
    const dmgBtn  = (isReussite && showDamageBtn && actorId)
      ? `<div style="margin-top:6px">
           <button type="button" class="ep-chat-dmg-btn" data-actor-id="${actorId}"
             style="background:linear-gradient(135deg,#5a1515,#3a0a0a);border:1px solid #a03030;
                    color:#f08080;padding:4px 12px;cursor:pointer;border-radius:4px;font-size:12px;">
             💥 Lancer les dommages…
           </button>
         </div>`
      : "";

    const flavor = `
<div class="ep-chat-roll">
  <div class="ep-roll-header">
    <span class="ep-actor-name">${esc(actor?.name ?? "?")}</span>
    <span class="ep-skill-name">${esc(skillNom)}</span>
  </div>
  <div class="ep-roll-body">
    <div class="ep-roll-dice">${EP_ROLL.fmt(value)}</div>
    <div class="ep-roll-details">
      <div class="ep-roll-target">Seuil : <b>${seuil}</b> (base ${target})${modInfo}</div>
      <div class="ep-roll-result ${resClass}">${resText}</div>
      ${isDouble ? `<div class="ep-roll-double">🎯 JET DOUBLE !</div>` : ""}
    </div>
  </div>
  ${dmgBtn}
</div>`;

    const rollMode = game.settings.get("core", "rollMode");
    await roll.toMessage(
      { speaker: ChatMessage.getSpeaker({ actor }), flavor },
      { rollMode }
    );

    return { roll, value, isReussite, isEchec, isCrit, isCritR, isCritE, mr, me, isExcep, isCuisant };
  }

  static async testOppose({ actor1, nom1, target1, actor2, nom2, target2 }) {
    const esc = foundry.utils.escapeHTML;
    nom1 = esc(nom1); nom2 = esc(nom2);
    const r1 = await EP_ROLL.rollD100(), r2 = await EP_ROLL.rollD100();
    const v1 = r1.value, v2 = r2.value;
    const ok1 = v1 === 0 || (v1 !== 99 && v1 <= target1);
    const ok2 = v2 === 0 || (v2 !== 99 && v2 <= target2);
    let vainqueur;
    if (ok1 && !ok2) vainqueur = nom1;
    else if (ok2 && !ok1) vainqueur = nom2;
    else if (ok1 && ok2)  vainqueur = v1 > v2 ? nom1 : v2 > v1 ? nom2 : "Impasse !";
    else                  vainqueur = "Impasse (les deux échouent)";

    const content = `
<div class="ep-chat-roll">
  <div class="ep-roll-header"><span class="ep-skill-name">⚔️ Test Opposé</span></div>
  <div class="ep-roll-body ep-roll-oppose">
    <div class="ep-roll-actor ${ok1 ? "ep-reussite" : "ep-echec"}">
      <b>${nom1}</b> — ${EP_ROLL.fmt(v1)} / Seuil ${target1}<br>
      ${ok1 ? `✅ MR ${v1}` : "❌ Échec"} ${EP_ROLL.isDouble(v1) ? "🎯" : ""}
    </div>
    <div class="ep-roll-vs">VS</div>
    <div class="ep-roll-actor ${ok2 ? "ep-reussite" : "ep-echec"}">
      <b>${nom2}</b> — ${EP_ROLL.fmt(v2)} / Seuil ${target2}<br>
      ${ok2 ? `✅ MR ${v2}` : "❌ Échec"} ${EP_ROLL.isDouble(v2) ? "🎯" : ""}
    </div>
  </div>
  <div class="ep-roll-result ep-reussite">🏆 ${vainqueur}</div>
</div>`;
    await ChatMessage.create({ content, speaker: ChatMessage.getSpeaker({ actor: actor1 }) });
  }
}
