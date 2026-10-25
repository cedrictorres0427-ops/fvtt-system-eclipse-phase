/**
 * Eclipse Phase ActorSheet PJ — Foundry VTT v13
 *
 * Jets de compétence : Shift+clic → dialogue avec difficulté + spécialisation optionnelle
 * Jets d'aptitude    : clic → dialogue avec multiplicateur (×1 / ×2 / ×3) + difficulté
 */
import { EP_ROLL } from "../helpers/roll.js";
import { coutItem } from "../item/item-sheet.js";

export class EclipsePhaseActorSheet extends ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:  ["eclipse-phase", "sheet", "actor", "character"],
      template: "systems/eclipse-phase/templates/actor/character-sheet.html",
      width: 920, height: 820,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "competences" }],
    });
  }

  get template() { return "systems/eclipse-phase/templates/actor/character-sheet.html"; }

  getData() {
    const ctx  = super.getData();
    const sys  = this.actor.system;
    const aptAbrs = { cog:"COG", coo:"COO", int:"INT", ref:"RÉF", ast:"AST", som:"SOM", vol:"VOL" };

    ctx.aptitudes = {};
    for (const [k, a] of Object.entries(sys.aptitudes || {})) {
      ctx.aptitudes[k] = { ...a, key: k, total: (a.base||0) + (a.morphe||0) + (a.divers||0) };
    }

    const SKILL_TIPS = {"armes_dispersion": "Maniement des armes à zone d'effet : fusils à pompe, freezers, lance-nuées, pistolets diamant...", "armes_guidage": "Utilisation des missiles guidés, micro-missiles et grenades à tête chercheuse.", "armes_rayon": "Maniement des armes à énergie : lasers, bolters à particules, fusils à plasma, pistolets étourdissants...", "armes_cinetiques": "Maniement des armes à feu et canons électriques : pistolets, PM, fusils d'assaut, fusils de précision...", "armes_contondantes": "Maniement des armes contondantes : matraques, bâtons, masses... et combat à poings nus.", "armes_jet": "Lancer de grenades, d'objets et d'armes de jet.", "armes_montees": "Utilisation des systèmes d'armes lourdes montés sur véhicules ou tourelles.", "armes_tranchantes": "Maniement des lames et couteaux : épées monofilament, vibrolames, lames de guêpe...", "assaut_psi": "Attaque mentale directe contre l'esprit d'une cible biologique. Nécessite l'aspect Psi.", "chute_libre": "Manœuvrer en apesanteur, effectuer des sorties EVA, se déplacer dans le vide spatial.", "combat_non_arme": "Combat à mains nues, prises, saisies et combat rapproché sans arme.", "controle": "Maintenir la concentration psi, résister aux interférences, contrôler les passes psi actives. Nécessite l'aspect Psi.", "controle_animal": "Dresser, diriger et interagir avec des animaux et créatures non-sapientes.", "deguisement": "Modifier son apparence physique, imiter quelqu'un d'autre, passer inaperçu.", "demolition": "Placer des explosifs, déminer, démolir des structures de façon contrôlée.", "escalade": "Grimper des surfaces, escalader des structures, progresser en vertical.", "escamotage": "Faire disparaître des objets, vols à la tire, prestidigitation, cacher des objets sur soi.", "esquive": "Éviter les attaques physiques, se mettre à l'abri, réagir aux dangers immédiats.", "fouille": "Trouver des objets cachés, fouiller des zones ou personnes, détecter des pièges.", "imposture": "Jouer un rôle, convaincre via le mensonge, se faire passer pour quelqu'un d'autre.", "infiltration": "Se déplacer sans bruit, rester dans l'ombre, éviter la détection visuelle ou auditive.", "infosec": "Sécuriser les systèmes informatiques, détecter les intrusions, protéger les données.", "interface": "Utiliser et pirater les appareils électroniques, systèmes de contrôle, serrures numériques.", "intimidation": "Contraindre par la peur, menacer, obtenir la coopération par la force psychologique.", "investigation": "Analyser des scènes, reconstituer des événements, trouver des indices.", "kinesique": "Lire le langage corporel, détecter les mensonges, interpréter les émotions et intentions d'autrui.", "natation": "Nager, plonger, se déplacer efficacement dans l'eau.", "navigation": "S'orienter, lire des cartes, piloter selon un cap, ne pas se perdre.", "parkour": "Courir, sauter, escalader des obstacles urbains, se déplacer rapidement en milieu complexe.", "perception": "Remarquer des détails, surveiller son environnement, détecter ce qui sort de l'ordinaire.", "persuasion": "Convaincre par des arguments, négocier, charmer, influencer via le dialogue.", "programmation": "Écrire du code, développer des logiciels, créer des IAG ou modifier des programmes.", "protocole": "Connaître et respecter les usages sociaux, l'étiquette, les hiérarchies et traditions.", "psychochirurgie": "Modifier l'esprit d'autrui, soigner les traumatismes mentaux, altérer les souvenirs.", "recherche": "Trouver des informations sur la Toile, compiler des données, mener des enquêtes documentaires.", "sensation": "Contrôler ses propres fonctions corporelles, percevoir via des sens internes ou exosens.", "subterfuge": "Tromper, manipuler, créer des distractions, monter des coups tordus.", "vol": "Voler avec des ailes ou systèmes de vol personnel, manœuvrer dans les airs."};
    const buildSkills = (obj, category) => {
      const out = {};
      const entries = Object.entries(obj || {}).sort((a, b) => {
        const nA = (a[1].nom || a[1].placeholder || a[0]).toLowerCase();
        const nB = (b[1].nom || b[1].placeholder || b[0]).toLowerCase();
        return nA.localeCompare(nB, "fr");
      });
      for (const [k, sk] of entries) {
        const apt      = ctx.aptitudes[sk.aptitude];
        // Décomposition : APT. = base + divers (hors morphe) ; le bonus de morphe
        // de l'aptitude s'affiche dans la colonne "Morphe" (badge) pour être visible.
        const aptMorphe     = apt?.morphe || 0;
        const aptHorsMorphe = (apt?.base||0) + (apt?.divers||0);
        const ppInvest = sk.base || 0;
        const total    = aptHorsMorphe + aptMorphe + ppInvest + (sk.bonus_hist || 0) + (sk.bonus_morphe || 0);
        out[k] = { ...sk, key: k, category,
                   apt_value: aptHorsMorphe,
                   apt_morphe: aptMorphe,
                   apt_morphe_str: aptMorphe > 0 ? `+${aptMorphe}` : String(aptMorphe),
                   aptAbr: aptAbrs[sk.aptitude] || "", total,
                   displayNom: sk.nom || sk.placeholder || "", tooltip: SKILL_TIPS[k] || "", bonus_hist: sk.bonus_hist || 0 };
      }
      return out;
    };
    ctx.competences_actives       = buildSkills(sys.competences_actives, "actives");
    ctx.competences_connaissances = buildSkills(sys.competences_connaissances, "connaissances");

    ctx.stats         = sys.stats        || {};
    ctx.reputation    = sys.reputation   || {};
    ctx.biographie    = sys.biographie   || {};
    ctx.morphe_actuel = sys.morphe_actuel|| {};
    ctx.aspects       = sys.aspects      || {};
    ctx.armure        = sys.armure       || {};
    ctx.equipement    = sys.equipement   || "";
    ctx.passes_psi    = sys.passes_psi   || "";

    // Les items marchands exposent leur prix calculé (prix exact ou moyen de la catégorie)
    const avecCout = (type) => this.actor.items.filter(i => i.type === type)
      .map(i => ({ id: i.id, img: i.img, name: i.name, type: i.type, system: i.system,
                   cout: coutItem(i.system) }));
    ctx.morphes          = this.actor.items.filter(i => i.type === "morphe");
    ctx.armes_melee      = avecCout("arme_melee");
    ctx.armes_distance   = avecCout("arme_distance");
    ctx.armures_items    = avecCout("armure_item");
    ctx.equipements      = avecCout("equipement");
    ctx.aspects_items    = this.actor.items.filter(i => i.type === "aspect");
    ctx.passes_psi_items = this.actor.items
      .filter(i => i.type === "passe_psi")
      .map(i => ({
        id: i.id, img: i.img, name: i.name, system: i.system,
        // Mode actif/passif — repli sur l'ancienne convention si non renseigné
        activation: i.system.activation || (i.system.type_psi === "gamma" ? "actif" : "passif"),
      }));

    const audMax = sys.stats?.aud?.max    || 5;
    const audPts = sys.stats?.aud?.points || 0;
    ctx.audacePips = Array.from({ length: audMax }, (_, i) => ({ filled: i < audPts }));
    ctx.isGM = game.user.isGM;
    return ctx;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".skill-roll").on("click",  ev => this._onRollSkill(ev));
    html.find(".apt-roll").on("click",    ev => this._onRollAptitude(ev));
    // Drag d'une compétence vers la barre de macros (hook hotbarDrop dans eclipsephase.js)
    html.find(".skill-roll").each((_, el) => {
      el.setAttribute("draggable", "true");
      el.addEventListener("dragstart", ev => {
        const row = el.closest("[data-skill-key]");
        const key = row?.dataset.skillKey;
        const cat = row?.dataset.category || "actives";
        if (!key) return;
        const skills = cat === "actives"
          ? this.actor.system.competences_actives
          : this.actor.system.competences_connaissances;
        const sk = skills?.[key];
        ev.dataTransfer.setData("text/plain", JSON.stringify({
          type:      "skill-roll",
          actorId:   this.actor.id,
          skillKey:  key,
          category:  cat,
          skillName: sk?.nom || sk?.placeholder || key,
        }));
      });
    });
    html.find(".aud-spend").on("click",    () => this.actor.depenseAudace());
    html.find(".aud-recover").on("click",  () => this.actor.regagneAudace(1));
    html.find(".btn-dmg-apply").on("click",() => this._onApplyDamage());
    html.find(".item-roll-dmg").on("click",ev => this._onItemRollDamage(ev));
    html.find(".item-edit").on("click",   ev => this._onItemEdit(ev));
    html.find(".item-delete").on("click", ev => this._onItemDelete(ev));
  }

  // ── Jet de compétence ───────────────────────────────────────
  // Clic simple : jet direct (difficulté Moyenne) · Shift+clic : dialogue complet
  async _onRollSkill(ev) {
    ev.preventDefault();
    const row = ev.currentTarget.closest("[data-skill-key]");
    const key = row?.dataset.skillKey;
    const cat = row?.dataset.category || "actives";
    if (!key) return;
    if (ev.shiftKey) return this._dialogCompetence(key, cat);
    return this.actor.rollSkill(key, cat, { showDamageBtn: true });
  }

  async _dialogCompetence(skillKey, category) {
    const sys    = this.actor.system;
    const skills = category === "actives" ? sys.competences_actives : sys.competences_connaissances;
    const sk     = skills?.[skillKey];
    if (!sk) return;

    const _apt     = sys.aptitudes?.[sk.aptitude] || {};
    // apt.total est calculé par prepareDerivedData (base + morphe + divers)
    const aptBase  = _apt.total ?? ((_apt.base||0) + (_apt.morphe||0) + (_apt.divers||0));
    // sk.total est calculé par prepareDerivedData (aptTotal + base + bonus)
    const total    = sk.total ?? (aptBase + (sk.base || 0) + (sk.bonus_hist || 0) + (sk.bonus_morphe || 0));
    const esc      = (foundry.utils.escapeHTML ?? Handlebars.escapeExpression);
    // nom reste brut : le titre du Dialog et skillNom (roll.js) sont échappés en aval
    const nom      = sk.nom || sk.placeholder || skillKey;
    const malus    = sys.stats?.malus_actions?.value || 0;
    const abrs     = { cog:"COG", coo:"COO", int:"INT", ref:"RÉF", ast:"AST", som:"SOM", vol:"VOL" };

    // Bloc spécialisation — toujours affiché si une spécialisation existe
    const specHTML = sk.specialisation ? `
      <div class="form-group" style="margin-top:8px;padding:6px 8px;background:rgba(58,128,200,0.08);border:1px solid rgba(58,128,200,0.3);border-radius:4px">
        <label style="font-weight:bold;color:var(--ep-accent2)">
          Spécialisation : <em>${esc(sk.specialisation)}</em>
        </label>
        <div style="font-size:11px;color:var(--ep-text2);margin:3px 0 5px">
          +10 si la spécialisation s'applique à cette action précise.
        </div>
        <label><input type="checkbox" name="spec" /> Appliquer le bonus de spécialisation (+10)</label>
      </div>` : "";

    const bonusHist   = sk.bonus_hist   || 0;  // permanent, toujours inclus
    const bonusMorphe = sk.bonus_morphe || 0; // conditionnel
    const bonusHTML = bonusMorphe ? `
      <div class="form-group" style="margin-top:6px;padding:5px 8px;background:rgba(58,128,200,0.08);border:1px solid rgba(58,128,200,0.3);border-radius:4px">
        <label style="font-weight:bold;color:var(--ep-accent2)">Bonus conditionnel : <em>+${bonusMorphe}</em></label>
        <div style="font-size:11px;color:var(--ep-text2);margin:2px 0 4px">Ce bonus ne s'applique que dans certaines circonstances (ex: interactions avec biomorphes).</div>
        <label><input type="checkbox" name="useBonus" checked /> Appliquer le bonus (+${bonusMorphe})</label>
      </div>` : "";
    const aptMorphe     = _apt.morphe || 0;
    const aptHorsMorphe = (_apt.base||0) + (_apt.divers||0);
    const detailHTML = `
      <table style="font-size:11px;color:#8898bc;margin-bottom:8px;border-collapse:collapse;width:100%">
        <tr><td>APT (${abrs[sk.aptitude]||"?"}, hors morphe) :</td><td style="text-align:right"><b>${aptHorsMorphe}</b></td></tr>
        ${aptMorphe ? `<tr><td>Bonus de morphe (aptitude) :</td><td style="text-align:right"><b>${aptMorphe > 0 ? "+" : ""}${aptMorphe}</b></td></tr>` : ""}
        <tr><td>PP investis (BASE) :</td><td style="text-align:right"><b>+${sk.base||0}</b></td></tr>
        ${bonusHist ? `<tr><td>Bonus H/F (permanent) :</td><td style="text-align:right"><b>+${bonusHist}</b></td></tr>` : ""}
        <tr style="border-top:1px solid #2c3550"><td><b>TOTAL</b></td><td style="text-align:right"><b>${total}</b></td></tr>
        ${malus ? `<tr style="color:#e08080"><td>Malus blessures/traumas :</td><td style="text-align:right"><b>−${malus}</b></td></tr>` : ""}
      </table>`;

    return new Promise(r => {
      new Dialog({
        title: `Jet de compétence : ${nom}`,
        content: `<form>
          ${detailHTML}
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
          ${specHTML}
          ${bonusHTML}
          <div class="form-group" style="margin-top:6px">
            <label><input type="checkbox" name="parDefaut" /> Test par défaut (APT seule = ${aptBase})</label>
          </div></form>`,
        buttons: {
          roll: { label: "🎲 Lancer", callback: async html => {
            const modif      = parseInt(html.find("[name='modif']").val()) || 0;
            const useSpec    = html.find("[name='spec']").is(":checked");
            const parDef     = html.find("[name='parDefaut']").is(":checked");
            const useBonus   = html.find("[name='useBonus']").is(":checked");
            const bonusApplied = useBonus ? bonusMorphe : 0;
            // bonus_hist = permanent (toujours inclus), bonus_morphe = conditionnel (checkbox)
            const baseTarget = parDef ? aptBase
              : (aptBase + (sk.base||0) + bonusHist + bonusApplied);
            await EP_ROLL.rollCompetence({
              actor: this.actor,
              skillNom: nom + (parDef ? " (défaut)" : "") + (useSpec ? ` [spéc: ${sk.specialisation}]` : "") + (bonusApplied ? ` [morphe +${bonusApplied}]` : ""),
              skillKey, target: baseTarget,
              modificateur: modif,
              specialisation: sk.specialisation || "",
              useSpecialisation: useSpec,
              parDefaut: parDef,
              malusBlessures: malus,
              showDamageBtn: true,
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
    const aptBase = (apt?.base || 0) + (apt?.morphe || 0) + (apt?.divers || 0);  // total (base+morphe+divers)
    const malus  = this.actor.system.stats?.malus_actions?.value || 0;
    const abrs   = { cog:"COG", coo:"COO", int:"INT", ref:"RÉF", ast:"AST", som:"SOM", vol:"VOL" };
    const noms   = { cog:"Cognition", coo:"Coordination", int:"Intuition", ref:"Réflexes", ast:"Astuce", som:"Somatique", vol:"Volonté" };
    const abr    = abrs[aptKey] || aptKey.toUpperCase();

    return new Promise(r => {
      new Dialog({
        title: `Test d'Aptitude : ${noms[aptKey] || aptKey}`,
        content: `<form>
          <p style="font-size:12px;color:#8898bc;margin-bottom:8px">
            ${abr} base : <b>${aptBase}</b>
            ${malus ? `<br><span style="color:#e08080">Malus blessures/traumas : −${malus}</span>` : ""}
          </p>
          <div class="form-group">
            <label>Multiplicateur :</label>
            <select name="multi">
              <option value="1">${abr} × 1 = ${aptBase}</option>
              <option value="2" selected>${abr} × 2 = ${aptBase * 2}</option>
              <option value="3">${abr} × 3 = ${aptBase * 3}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Difficulté :</label>
            <select name="modif">
              <option value="30">Sans effort (+30)</option>
              <option value="20">Simple (+20)</option>
              <option value="10">Facile (+10)</option>
              <option value="0" selected>Moyen (±0)</option>
              <option value="-10">Difficile (−10)</option>
              <option value="-20">Défi (−20)</option>
              <option value="-30">Expert (−30)</option>
            </select>
          </div></form>`,
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

  // ── Dommages items ───────────────────────────────────────────
  async _onItemRollDamage(ev) {
    ev.preventDefault();
    const id = ev.currentTarget.closest("[data-item-id]")?.dataset.itemId;
    if (id) await this.actor.rollDamage(id);
  }

  async _onApplyDamage() {
    const sys = this.actor.system.stats;
    new Dialog({
      title: `Dommages/Stress — ${this.actor.name}`,
      content: `<form>
        <p style="font-size:11px;color:#8898bc">
          Blessures : ${sys?.blessures?.value||0} · Traumas : ${sys?.traumas?.value||0} · Malus : −${sys?.malus_actions?.value||0}
        </p>
        <div class="form-group"><label>Quantité :</label><input type="number" name="qty" value="0" min="0" style="width:72px" /></div>
        <div class="form-group"><label>Type :</label>
          <select name="type">
            <option value="dmg">Dommages physiques</option>
            <option value="stress">Stress mental</option>
            <option value="soins">Soins (réduire dommages)</option>
            <option value="repos">Repos (réduire stress)</option>
          </select></div></form>`,
      buttons: { ok: { label: "Appliquer", callback: async html => {
        const qty  = parseInt(html.find("[name='qty']").val()) || 0;
        const type = html.find("[name='type']").val();
        if      (type === "dmg")    await this.actor.appliquerDommages(qty);
        else if (type === "stress") await this.actor.appliquerStress(qty);
        else if (type === "soins") {
          const cur = sys?.dommages?.value || 0;
          const sb  = sys?.sb?.value || 6;
          const nv  = Math.max(0, cur - qty);
          await this.actor.update({ "system.stats.dommages.value": nv, "system.stats.blessures.value": Math.floor(nv/sb) });
          ChatMessage.create({ content: `<div class="ep-chat-roll"><b>${this.actor.name}</b> soigne <b>${qty}</b> dommages. Reste : ${nv}.</div>`, speaker: ChatMessage.getSpeaker({ actor: this.actor }) });
        } else {
          const cur = sys?.stress?.value || 0;
          const st  = sys?.st?.value || 4;
          const nv  = Math.max(0, cur - qty);
          await this.actor.update({ "system.stats.stress.value": nv, "system.stats.traumas.value": Math.floor(nv/st) });
          ChatMessage.create({ content: `<div class="ep-chat-roll"><b>${this.actor.name}</b> récupère <b>${qty}</b> stress. Reste : ${nv}.</div>`, speaker: ChatMessage.getSpeaker({ actor: this.actor }) });
        }
      }}},
      default: "ok",
    }).render(true);
  }


  // ── Drop item sur la fiche ───────────────────────────────────
  // NB : les morphes sont appliqués par EclipsePhaseItem._applyMorpheBonuses
  // (hook _onCreate) — un seul chemin d'application, pas de doublon ici.
  async _onDropItem(event, data) {
    const item = await Item.fromDropData(data);
    if (!item) return super._onDropItem(event, data);

    // ── Armure : ajouter CA sur la fiche ───────────────────────
    if (item.type === "armure_item") {
      const s   = item.system;
      const cur = this.actor.system.armure || {};
      const upd = {
        "system.armure.energie":   (cur.energie  || 0) + (s.ca_energie  || 0),
        "system.armure.cinetique": (cur.cinetique || 0) + (s.ca_cinetique || 0),
      };
      await this.actor.update(upd);
      ui.notifications.info(`${item.name} équipée — Armure É:${upd["system.armure.energie"]} / C:${upd["system.armure.cinetique"]}`);
      return super._onDropItem(event, data);
    }

    return super._onDropItem(event, data);
  }

  _onItemEdit(ev) { const id = ev.currentTarget.closest("[data-item-id]")?.dataset.itemId; this.actor.items.get(id)?.sheet.render(true); }
  async _onItemDelete(ev) {
    const id   = ev.currentTarget.closest("[data-item-id]")?.dataset.itemId;
    const item = this.actor.items.get(id);
    if (!item) return;
    if (!await Dialog.confirm({ title: "Supprimer", content: `Supprimer <b>${item.name}</b> ?` })) return;

    // Si armure : soustraire ses valeurs de la fiche avant suppression
    if (item.type === "armure_item") {
      const s   = item.system;
      const cur = this.actor.system.armure || {};
      await this.actor.update({
        "system.armure.energie":   Math.max(0, (cur.energie   || 0) - (s.ca_energie   || 0)),
        "system.armure.cinetique": Math.max(0, (cur.cinetique || 0) - (s.ca_cinetique || 0)),
      });
    }
    // Si morphe : remettre les bonus d'aptitudes et les infos de morphe à zéro
    if (item.type === "morphe") {
      const upd = {};
      for (const apt of ["cog", "coo", "int", "ref", "ast", "som", "vol"]) {
        upd[`system.aptitudes.${apt}.morphe`] = 0;
      }
      upd["system.morphe_actuel.nom"]          = "";
      upd["system.morphe_actuel.type"]         = "biomorphe";
      upd["system.morphe_actuel.mobilite"]     = "";
      upd["system.morphe_actuel.armure"]       = "";
      upd["system.morphe_actuel.desavantages"] = "";
      upd["system.morphe_actuel.notes"]        = "";
      upd["system.morphe_actuel.bonus_init"]   = 0;
      upd["system.morphe_actuel.image_echelle"] = "";
      upd["system.stats.end.morphe"]           = 0;
      await this.actor.update(upd);
    }

    await item.delete();
  }

  _getSubmitData(updateData = {}) {
    const data = super._getSubmitData(updateData);
    for (const [k, v] of Object.entries(data)) {
      if (Array.isArray(v)) { const ne = v.filter(x => x !== "" && x !== null); data[k] = ne.length ? ne[ne.length-1] : (v[0]??""); }
    }
    return data;
  }
}
