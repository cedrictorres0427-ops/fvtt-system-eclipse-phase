export async function preloadHandlebarsTemplates() {
  return loadTemplates([
    "systems/eclipse-phase/templates/apps/character-creator.html",
    "systems/eclipse-phase/templates/actor/character-sheet.html",
    "systems/eclipse-phase/templates/actor/npc-sheet.html",
    "systems/eclipse-phase/templates/item/morphe-sheet.html",
    "systems/eclipse-phase/templates/item/equipment-sheet.html",
    "systems/eclipse-phase/templates/item/aspect-sheet.html",
    "systems/eclipse-phase/templates/item/passe-psi-sheet.html",
    "systems/eclipse-phase/templates/item/arme-melee-sheet.html",
    "systems/eclipse-phase/templates/item/arme-distance-sheet.html",
    "systems/eclipse-phase/templates/item/armure-item-sheet.html",
    "systems/eclipse-phase/templates/item/competence-sheet.html",
  ]);
}
