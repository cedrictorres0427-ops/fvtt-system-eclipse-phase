import { CharacterCreator } from "./module/apps/character-creator.js";
/**
 * Eclipse Phase v1 — Système Foundry VTT v13
 */
import { EclipsePhaseActor }     from "./module/actor/actor.js";
import { EclipsePhaseActorSheet } from "./module/actor/actor-sheet.js";
import { EclipsePhaseNPCSheet }   from "./module/actor/npc-sheet.js";
import { EclipsePhaseItem }       from "./module/item/item.js";
import { EclipsePhaseItemSheet }  from "./module/item/item-sheet.js";
import { preloadHandlebarsTemplates } from "./module/helpers/templates.js";
import { EP_ROLL }                from "./module/helpers/roll.js";

Hooks.once("init", async function () {
  console.log("Eclipse Phase | Initialisation (v13)…");

  game.eclipsephase = {
    EclipsePhaseActor, EclipsePhaseItem, EP_ROLL,
    openCharacterCreator: () => new CharacterCreator().render(true),
    rollSkill:      (actorId, key, cat) => game.actors.get(actorId)?.rollSkill(key, cat, {showDamageBtn:true}),
    openDamageDialog: (actorId) => _openDamageDialog(actorId),
  };

  CONFIG.Actor.documentClass = EclipsePhaseActor;
  CONFIG.Item.documentClass  = EclipsePhaseItem;

  Actors.unregisterSheet("core", ActorSheet);
  Items.unregisterSheet("core",  ItemSheet);

  Actors.registerSheet("eclipse-phase", EclipsePhaseActorSheet, {
    types:       ["character"],
    makeDefault: true,
    label:       "Fiche PJ",
  });
  Actors.registerSheet("eclipse-phase", EclipsePhaseNPCSheet, {
    types:       ["npc"],
    makeDefault: true,
    label:       "Fiche PNJ",
  });
  Items.registerSheet("eclipse-phase", EclipsePhaseItemSheet, {
    makeDefault: true,
    label:       "Fiche Objet EP",
  });

  await preloadHandlebarsTemplates();
  _registerHelpers();
  _registerSettings();
  _registerChatHooks();
  console.log("Eclipse Phase | Prêt.");
});

/** Popup sélection arme + jet dommages */
async function _openDamageDialog(actorId) {
  const actor = game.actors.get(actorId);
  if (!actor) return;

  const armes = actor.items.filter(i => i.type === "arme_melee" || i.type === "arme_distance");
  if (!armes.length) {
    ui.notifications.warn(`${actor.name} ne possède aucune arme dans sa fiche.`);
    return;
  }

  const esc = foundry.utils.escapeHTML;
  const optionsHTML = armes.map(a => `<option value="${a.id}">${esc(a.name)} (${esc(a.system.vd || "")}${a.type === "arme_melee" && a.system.vd_som ? " + BD" : ""}, PA ${a.system.pa||0})</option>`).join("");

  new Dialog({
    title: `💥 Dommages — ${actor.name}`,
    content: `<form>
      <p style="font-size:12px;color:#8898bc;margin-bottom:8px">Choisissez l'arme utilisée pour lancer les dommages.</p>
      <div class="form-group">
        <label>Arme :</label>
        <select name="arme">${optionsHTML}</select>
      </div>
    </form>`,
    buttons: {
      roll: {
        label: "🎲 Lancer dommages",
        callback: async (html) => {
          const armeId = html.find("[name='arme']").val();
          await actor.rollDamage(armeId);
        },
      },
      cancel: { label: "Annuler" },
    },
    default: "roll",
  }).render(true);
}

function _registerHelpers() {
  Handlebars.registerHelper("eq",  (a, b) => a === b);
  Handlebars.registerHelper("add",  (a, b) => (a||0) + (b||0));
  Handlebars.registerHelper("gt60", (v)    => (v||0) > 60);
  Handlebars.registerHelper("gt0", (v)    => (v||0) > 0);
  Handlebars.registerHelper("aptAbr", (k) =>
    ({cog:"COG",coo:"COO",int:"INT",ref:"RÉF",ast:"AST",som:"SOM",vol:"VOL"})[k] || (k||"").toUpperCase()
  );
  Handlebars.registerHelper("concat", (...args) => { args.pop(); return args.join(""); });
  Handlebars.registerHelper("times",  (n, b)    => { let r=""; for(let i=0;i<n;i++) r+=b.fn(i); return r; });
}

function _registerSettings() {
  game.settings.register("eclipse-phase", "critiquesDoubles", {
    name: "Critiques sur jets doubles",
    scope: "world", config: true, type: Boolean, default: true,
  });
}


/**
 * Boutons de dommages dans le chat.
 * v13+ : hook renderChatMessageHTML (HTMLElement) — renderChatMessage est déprécié.
 * v12  : hook renderChatMessage (jQuery).
 */
function _bindChatDamageButtons(root) {
  root.querySelectorAll(".ep-chat-dmg-btn").forEach(btn => {
    btn.addEventListener("click", async (ev) => {
      ev.preventDefault();
      const actorId = ev.currentTarget.dataset.actorId;
      if (actorId) await _openDamageDialog(actorId);
    });
  });
}

function _registerChatHooks() {
  if (game.release.generation >= 13) {
    Hooks.on("renderChatMessageHTML", (message, html) => _bindChatDamageButtons(html));
  } else {
    Hooks.on("renderChatMessage", (message, html) => _bindChatDamageButtons(html[0]));
  }
}

Hooks.on("hotbarDrop", (bar, data, slot) => {
  if (data.type === "skill-roll") {
    _createSkillMacro(data, slot);
    return false;
  }
});

async function _createSkillMacro(data, slot) {
  const cmd = `game.eclipsephase.rollSkill("${data.actorId}","${data.skillKey}","${data.category}");`;
  let macro = game.macros.find(m => m.name === data.skillName && m.command === cmd);
  if (!macro) macro = await Macro.create({ name: data.skillName, type: "script", img: "icons/svg/d10-black.svg", command: cmd });
  await game.user.assignHotbarMacro(macro, slot);
}


/**
 * Bouton "Créer un PJ" dans la barre latérale des Acteurs
 */
// ── Bouton Création PJ dans la sidebar Acteurs (Foundry v13) ──
function _injectCreatorBtn() {
  if (document.querySelector(".ep-creator-btn")) return; // déjà injecté
  // Foundry v13 : la sidebar Acteurs a un header avec des boutons action
  const targets = [
    "#actors .directory-header",
    "#actors .header-actions",
    "#actors",
    ".actors-sidebar",
  ];
  let container = null;
  for (const sel of targets) {
    container = document.querySelector(sel);
    if (container) break;
  }
  if (!container) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "ep-creator-btn";
  btn.innerHTML = '<i class="fas fa-user-plus"></i> Nouveau PJ (EP)';
  btn.title = "Utilitaire de création de personnage Eclipse Phase";
  btn.addEventListener("click", () => game.eclipsephase.openCharacterCreator());

  // Insérer en premier dans le container trouvé
  container.insertBefore(btn, container.firstChild);
}

Hooks.on("renderActorDirectory", () => { setTimeout(_injectCreatorBtn, 100); });
Hooks.on("renderSidebarTab",     () => { setTimeout(_injectCreatorBtn, 100); });
Hooks.on("ready",                () => { setTimeout(_injectCreatorBtn, 500); });
