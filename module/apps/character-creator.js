/**
 * Eclipse Phase — Utilitaire de Création de Personnage
 * Suit les étapes officielles du livre de base VF (p.130–138)
 */

const APT_KEYS   = ["cog","coo","int","ref","ast","som","vol"];
const APT_NOMS   = {cog:"Cognition",coo:"Coordination",int:"Intuition",ref:"Réflexes",ast:"Astuce",som:"Somatique",vol:"Volonté"};
const APT_ABRS   = {cog:"COG",coo:"COO",int:"INT",ref:"RÉF",ast:"AST",som:"SOM",vol:"VOL"};
const APT_HINTS  = {
  cog:"Mémoire, logique, sciences",
  coo:"Dextérité, précision, équilibre",
  int:"Intuition, conscience, créativité",
  ref:"Vitesse de réaction, sens",
  ast:"Charisme, persuasion, tromperie",
  som:"Force, endurance, résistance",
  vol:"Volonté, résistance mentale, psi",
};

const RESEAUX = [
  {key:"arep", nom:"@-Rép (Anarchistes)"},
  {key:"crep", nom:"C-Rép (CivicNet)"},
  {key:"erep", nom:"E-Rép (VaguÉco)"},
  {key:"frep", nom:"F-Rép (Fame)"},
  {key:"grep", nom:"G-Rép (Guanxi)"},
  {key:"irep", nom:"I-Rép (L'Œil/Firewall)"},
  {key:"rrep", nom:"R-Rép (RRA)"},
];

const HISTORIQUES = [
  {id:"colons_lunaires", nom:"Colons Lunaires", morphes:"basiques, épisseurs",
   bonusStr:"+10 Pilotage:Véhicules terrestres, +10 Technique/Théorie/Profession (choix), +20 Réseau:Hypercorps",
   bonus_fixes:[{sk:"pilotage_1",val:10,label:"Véhicules terrestres"},{sk:"reseau_1",val:20,label:"Hypercorps"}],
   bonus_libres:[{val:10,label:"Compétence au choix",choices:["technique","theorie","profession"],type:"connaissance"}]},
  {id:"ecumeurs", nom:"Écumeurs-nés", morphes:"tous, surtout folivores",
   bonusStr:"+10 Persuasion ou Subterfuge (choix), +10 Fouille, +20 Réseau:Autonomistes",
   bonus_fixes:[{sk:"fouille",val:10,label:"Fouille"},{sk:"reseau_1",val:20,label:"Autonomistes"}],
   bonus_libres:[{val:10,label:"Persuasion ou Subterfuge",choices:["persuasion","subterfuge"],type:"active"}]},
  {id:"egares", nom:"Égarés", morphes:"tous",
   bonusStr:"+20 à 2 compétences Connaissance (choix), Aspect Psi niv.1 gratuit",
   bonus_fixes:[],
   bonus_libres:[{val:20,label:"Connaissance 1 au choix",type:"connaissance"},{val:20,label:"Connaissance 2 au choix",type:"connaissance"}],
   bonus_aspects:["Psi (niveau 1)"]},
  {id:"infolife", nom:"Infolife", morphes:"infomorphes, châssis, synthétiques",
   bonusStr:"+20 Interface, +20 Réseau:[choix]",
   bonus_fixes:[{sk:"interface",val:20,label:"Interface"}],
   bonus_libres:[{val:20,label:"Réseau au choix",choices:["reseau_1","reseau_2","reseau_3","reseau_4"],type:"active",placeholder:"Réseau"}]},
  {id:"jovien", nom:"Jovien", morphes:"basiques, épisseurs",
   bonusStr:"+10 Arme (choix), +10 Esquive, +20 Réseau:Hypercorps ; restriction nanoware",
   bonus_fixes:[{sk:"esquive",val:10,label:"Esquive"},{sk:"reseau_1",val:20,label:"Hypercorps"}],
   bonus_libres:[{val:10,label:"Arme au choix",choices:["armes_cinetiques","armes_contondantes","armes_tranchantes","armes_melee_1","armes_rayon"],type:"active",placeholder:"Arme"}]},
  {id:"lunaire", nom:"Lunaire", morphes:"châssis, exaltés, basiques, épisseurs, synthétiques",
   bonusStr:"+10 Langue:[choix], +20 Réseau:Hypercorps, +10 Réseau:Écologistes",
   bonus_fixes:[{sk:"reseau_1",val:20,label:"Hypercorps"},{sk:"reseau_2",val:10,label:"Écologistes"}],
   bonus_libres:[{val:10,label:"Langue au choix",type:"connaissance",placeholder:"Langue"}]},
  {id:"maraudeur", nom:"Maraudeurs", morphes:"tous, surtout folivores",
   bonusStr:"+10 Navigation, +20 Pilotage:Vaisseaux spatiaux, +10 Réseau:[choix]",
   bonus_fixes:[{sk:"navigation",val:10,label:"Navigation"},{sk:"pilotage_1",val:20,label:"Vaisseaux spatiaux"}],
   bonus_libres:[{val:10,label:"Réseau au choix",choices:["reseau_1","reseau_2","reseau_3","reseau_4"],type:"active",placeholder:"Réseau"}]},
  {id:"martien", nom:"Martiens", morphes:"basiques, épisseurs, oxydés",
   bonusStr:"+10 Pilotage:Véhicules terrestres, +10 Technique/Théorie/Profession (choix), +20 Réseau:Hypercorps",
   bonus_fixes:[{sk:"pilotage_1",val:10,label:"Véhicules terrestres"},{sk:"reseau_1",val:20,label:"Hypercorps"}],
   bonus_libres:[{val:10,label:"Compétence au choix",choices:["technique","theorie","profession"],type:"connaissance"}]},
  {id:"reinstance", nom:"Réinstancié", morphes:"châssis, synthétiques",
   bonusStr:"+20 Interface, +10 Réseau:[choix], 0 crédit de départ",
   bonus_fixes:[{sk:"interface",val:20,label:"Interface"}],
   bonus_libres:[{val:10,label:"Réseau au choix",choices:["reseau_1","reseau_2","reseau_3","reseau_4"],type:"active",placeholder:"Réseau"}],
   credits:0},
  {id:"rescape", nom:"Rescapé de la Chute", morphes:"basiques",
   bonusStr:"+20 à 2 compétences (choix), −10 réputation de départ",
   bonus_fixes:[],
   bonus_libres:[{val:20,label:"Compétence 1 au choix"},{val:20,label:"Compétence 2 au choix"}],
   credits:2500, rep_malus:10},
  {id:"surevolu", nom:"Surévolué", morphes:"surévolués uniquement",
   bonusStr:"+20 Réseau:[choix], +10 à 2 compétences (choix)",
   bonus_fixes:[],
   bonus_libres:[{val:20,label:"Réseau au choix",choices:["reseau_1","reseau_2","reseau_3","reseau_4"],type:"active",placeholder:"Réseau"},{val:10,label:"Compétence 1 au choix"},{val:10,label:"Compétence 2 au choix"}]},
  {id:"utopie", nom:"Utopie", morphes:"tous",
   bonusStr:"+20 à 2 compétences (choix)",
   bonus_fixes:[],
   bonus_libres:[{val:20,label:"Compétence 1 au choix"},{val:20,label:"Compétence 2 au choix"}]},
];

const FACTIONS = [
  {id:"anarchiste",   nom:"Anarchistes",
   bonusStr:"+10 Réseau:Autonomistes, +10 à une compétence",
   bonus_fixes:[{sk:"reseau_1",val:10,label:"Autonomistes"}],
   bonus_libres:[{val:10,label:"Compétence au choix"}]},
  {id:"argonaute",    nom:"Argonautes",
   bonusStr:"+10 Réseau:RRA, +10 à une compétence",
   bonus_fixes:[{sk:"reseau_1",val:10,label:"RRA"}],
   bonus_libres:[{val:10,label:"Compétence au choix"}]},
  {id:"barsoomien",   nom:"Barsoomiens",
   bonusStr:"+10 Réseau:Autonomistes, +10 Pilotage:Véhicules terrestres",
   bonus_fixes:[{sk:"reseau_1",val:10,label:"Autonomistes"},{sk:"pilotage_1",val:10,label:"Véhicules terrestres"}],
   bonus_libres:[]},
  {id:"bioconserv",   nom:"Bioconservateurs",
   bonusStr:"+10 Réseau:Hypercorps, +10 Persuasion",
   bonus_fixes:[{sk:"reseau_1",val:10,label:"Hypercorps"},{sk:"persuasion",val:10,label:"Persuasion"}],
   bonus_libres:[]},
  {id:"consortium",   nom:"Consortium Planétaire",
   bonusStr:"+10 Réseau:Hypercorps, +10 à une compétence",
   bonus_fixes:[{sk:"reseau_1",val:10,label:"Hypercorps"}],
   bonus_libres:[{val:10,label:"Compétence au choix"}]},
  {id:"extropien",    nom:"Extropiens",
   bonusStr:"+10 Réseau:Autonomistes, +10 à une compétence",
   bonus_fixes:[{sk:"reseau_1",val:10,label:"Autonomistes"}],
   bonus_libres:[{val:10,label:"Compétence au choix"}]},
  {id:"firewall",     nom:"Firewall",
   bonusStr:"+10 Réseau:Firewall, +10 à une compétence",
   bonus_fixes:[{sk:"reseau_1",val:10,label:"Firewall"}],
   bonus_libres:[{val:10,label:"Compétence au choix"}]},
  {id:"hypercorp",    nom:"Hypercorps",
   bonusStr:"+20 Réseau:Hypercorps, +10 Pilotage:[choix]",
   bonus_fixes:[{sk:"reseau_1",val:20,label:"Hypercorps"}],
   bonus_libres:[{val:10,label:"Pilotage au choix",choices:["pilotage_1","pilotage_2"],type:"active",placeholder:"Pilotage"}]},
  {id:"jovien_rep",   nom:"République Jovienne",
   bonusStr:"+10 Réseau:Hypercorps, +10 Arme:[choix]",
   bonus_fixes:[{sk:"reseau_1",val:10,label:"Hypercorps"}],
   bonus_libres:[{val:10,label:"Arme au choix",choices:["armes_cinetiques","armes_contondantes","armes_tranchantes","armes_melee_1","armes_rayon"],type:"active",placeholder:"Arme"}]},
  {id:"margellan",    nom:"Margellans",
   bonusStr:"+10 Pilotage:Vaisseaux spatiaux, +10 Réseau:[choix], +10 libre",
   bonus_fixes:[{sk:"pilotage_1",val:10,label:"Vaisseaux spatiaux"}],
   bonus_libres:[{val:10,label:"Réseau au choix",choices:["reseau_1","reseau_2","reseau_3","reseau_4"],type:"active",placeholder:"Réseau"},{val:10,label:"Compétence au choix"}]},
  {id:"mercurien",    nom:"Mercuriens",
   bonusStr:"+10 à 2 compétences (choix), +20 Réseau:[choix]",
   bonus_fixes:[],
   bonus_libres:[{val:20,label:"Réseau au choix",choices:["reseau_1","reseau_2","reseau_3","reseau_4"],type:"active",placeholder:"Réseau"},{val:10,label:"Compétence 1 au choix"},{val:10,label:"Compétence 2 au choix"}]},
  {id:"nano_ecolo",   nom:"Nano-écologistes",
   bonusStr:"+10 Réseau:Écologistes, +10 à une compétence",
   bonus_fixes:[{sk:"reseau_1",val:10,label:"Écologistes"}],
   bonus_libres:[{val:10,label:"Compétence au choix"}]},
  {id:"titanien",     nom:"Titaniens",
   bonusStr:"+10 Réseau:Autonomistes, +10 à une compétence",
   bonus_fixes:[{sk:"reseau_1",val:10,label:"Autonomistes"}],
   bonus_libres:[{val:10,label:"Compétence au choix"}]},
  {id:"ultimate",     nom:"Ultimates",
   bonusStr:"+10 Réseau:Hypercorps, +10 combat ou endurance",
   bonus_fixes:[{sk:"reseau_1",val:10,label:"Hypercorps"}],
   bonus_libres:[{val:10,label:"Compétence de combat/endurance au choix",choices:["armes_cinetiques","armes_contondantes","armes_tranchantes","combat_non_arme","escalade"],type:"active"}]},
];

/**
 * Tables de reference des competences (source unique — dupliquees auparavant
 * dans getData() et _createActor(), et alignees sur template.json).
 */
const ACTIVES_TPL = {
"armes_dispersion": {
"nom": "Armes à dispersion",
"aptitude": "coo",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"armes_distance_1": {
"nom": "",
"aptitude": "coo",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"placeholder": "Armes à distance exo.",
"base": 0
},
"armes_distance_2": {
"nom": "",
"aptitude": "coo",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"placeholder": "Armes à distance exo.",
"base": 0
},
"armes_guidage": {
"nom": "Armes à guidage",
"aptitude": "coo",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"armes_rayon": {
"nom": "Armes à rayon",
"aptitude": "coo",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"armes_cinetiques": {
"nom": "Armes cinétiques",
"aptitude": "coo",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"armes_contondantes": {
"nom": "Armes contondantes",
"aptitude": "som",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"armes_jet": {
"nom": "Armes de jet",
"aptitude": "coo",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"armes_melee_1": {
"nom": "",
"aptitude": "som",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"placeholder": "Armes de mêlée exo.",
"base": 0
},
"armes_melee_2": {
"nom": "",
"aptitude": "som",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"placeholder": "Armes de mêlée exo.",
"base": 0
},
"armes_montees": {
"nom": "Armes montées",
"aptitude": "int",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"armes_tranchantes": {
"nom": "Armes tranchantes",
"aptitude": "som",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"assaut_psi": {
"nom": "Assaut psi",
"aptitude": "vol",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": true,
"base": 0
},
"chute_libre": {
"nom": "Chute libre",
"aptitude": "ref",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"combat_non_arme": {
"nom": "Combat non-armé",
"aptitude": "som",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"controle": {
"nom": "Contrôle",
"aptitude": "vol",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": true,
"base": 0
},
"controle_animal": {
"nom": "Contrôle animal",
"aptitude": "ast",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"deguisement": {
"nom": "Déguisement",
"aptitude": "int",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"demolition": {
"nom": "Démolition",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": true,
"base": 0
},
"escalade": {
"nom": "Escalade",
"aptitude": "som",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"escamotage": {
"nom": "Escamotage",
"aptitude": "coo",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"esquive": {
"nom": "Esquive",
"aptitude": "ref",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"fouille": {
"nom": "Fouille",
"aptitude": "int",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"imposture": {
"nom": "Imposture",
"aptitude": "ast",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"infiltration": {
"nom": "Infiltration",
"aptitude": "coo",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"infosec": {
"nom": "Infosec",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": true,
"base": 0
},
"interface": {
"nom": "Interface",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"intimidation": {
"nom": "Intimidation",
"aptitude": "ast",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"investigation": {
"nom": "Investigation",
"aptitude": "int",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"kinesique": {
"nom": "Kinésique",
"aptitude": "ast",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"materiel_1": {
"nom": "",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"placeholder": "Matériel : ...",
"base": 0
},
"materiel_2": {
"nom": "",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"placeholder": "Matériel : ...",
"base": 0
},
"medecine_1": {
"nom": "",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"placeholder": "Médecine : ...",
"base": 0
},
"medecine_2": {
"nom": "",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"placeholder": "Médecine : ...",
"base": 0
},
"natation": {
"nom": "Natation",
"aptitude": "som",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"navigation": {
"nom": "Navigation",
"aptitude": "int",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"parkour": {
"nom": "Parkour",
"aptitude": "som",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"perception": {
"nom": "Perception",
"aptitude": "int",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"persuasion": {
"nom": "Persuasion",
"aptitude": "ast",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"pilotage_1": {
"nom": "",
"aptitude": "ref",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"placeholder": "Pilotage : ...",
"base": 0
},
"pilotage_2": {
"nom": "",
"aptitude": "ref",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"placeholder": "Pilotage : ...",
"base": 0
},
"programmation": {
"nom": "Programmation",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": true,
"base": 0
},
"protocole": {
"nom": "Protocole",
"aptitude": "ast",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"psychochirurgie": {
"nom": "Psychochirurgie",
"aptitude": "int",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"recherche": {
"nom": "Recherche",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"reseau_1": {
"nom": "",
"aptitude": "ast",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"placeholder": "Réseau : ...",
"base": 0
},
"reseau_2": {
"nom": "",
"aptitude": "ast",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"placeholder": "Réseau : ...",
"base": 0
},
"reseau_3": {
"nom": "",
"aptitude": "ast",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"placeholder": "Réseau : ...",
"base": 0
},
"reseau_4": {
"nom": "",
"aptitude": "ast",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"placeholder": "Réseau : ...",
"base": 0
},
"sensation": {
"nom": "Sensation",
"aptitude": "int",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": true,
"base": 0
},
"subterfuge": {
"nom": "Subterfuge",
"aptitude": "ast",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
},
"vol": {
"nom": "Vol",
"aptitude": "som",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"no_default": false,
"base": 0
}
};
const CONNAIS_TPL = {
"art_1": {
"nom": "",
"aptitude": "int",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Art : ...",
"base": 0
},
"art_2": {
"nom": "",
"aptitude": "int",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Art : ...",
"base": 0
},
"art_3": {
"nom": "",
"aptitude": "int",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Art : ...",
"base": 0
},
"art_4": {
"nom": "",
"aptitude": "int",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Art : ...",
"base": 0
},
"interet_1": {
"nom": "",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Intérêt : ...",
"base": 0
},
"interet_2": {
"nom": "",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Intérêt : ...",
"base": 0
},
"interet_3": {
"nom": "",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Intérêt : ...",
"base": 0
},
"interet_4": {
"nom": "",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Intérêt : ...",
"base": 0
},
"langue_1": {
"nom": "",
"aptitude": "int",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Langue : ...",
"base": 0
},
"langue_2": {
"nom": "",
"aptitude": "int",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Langue : ...",
"base": 0
},
"langue_3": {
"nom": "",
"aptitude": "int",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Langue : ...",
"base": 0
},
"langue_4": {
"nom": "",
"aptitude": "int",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Langue : ...",
"base": 0
},
"profession_1": {
"nom": "",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Profession : ...",
"base": 0
},
"profession_2": {
"nom": "",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Profession : ...",
"base": 0
},
"profession_3": {
"nom": "",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Profession : ...",
"base": 0
},
"profession_4": {
"nom": "",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Profession : ...",
"base": 0
},
"theorie_1": {
"nom": "",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Théorie : ...",
"base": 0
},
"theorie_2": {
"nom": "",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Théorie : ...",
"base": 0
},
"theorie_3": {
"nom": "",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Théorie : ...",
"base": 0
},
"theorie_4": {
"nom": "",
"aptitude": "cog",
"bonus_morphe": 0,
"specialisation": "",
"autres_bonus": 0,
"placeholder": "Théorie : ...",
"base": 0
}
};

function _defaultData() {
  const apts = {};
  APT_KEYS.forEach(k => apts[k] = 15);
  const skActives = {}, skConnais = {};
  return {
    nom:"", concept:"",
    historique:"", faction:"",
    apts,
    sk_actives: skActives,
    sk_connais:  skConnais,
    sk_noms_actives: {},
    sk_noms_connais: {},
    bonus_libres: [],  // [{source:"hist"|"fact", label:"...", val:10, chosen_key:"pilotage_2"}]
    audace: 1,
    reps: {arep:0,crep:0,erep:0,frep:0,grep:0,irep:0,rrep:0},
    credits_bonus: 0,
    morphe_id: "",
    motiv1:"",motiv2:"",motiv3:"",
  };
}

/**
 * Coût PP pour ppInvest points investis dans une compétence dont l'aptitude vaut aptBase.
 * Règle : 1 PP par point jusqu'à un total de 60 ; 2 PP par point au-delà (jusqu'à 80 max).
 * Ex : aptBase=20 → seuil à 40 PP investis (20+40=60). Du 41e PP : ×2.
 */
/**
 * Coût PP pour ppInvest points investis dans une compétence dont l'aptitude vaut aptBase.
 * Règle EP : 1 PP/pt jusqu'à ce que (aptBase + ppInvest) atteigne 60, puis 2 PP/pt au-delà.
 * Le bonus historique/faction est GRATUIT et n'affecte PAS ce calcul.
 * Ex : aptBase=20 → seuil à 40 PP investis (20+40=60). Du 41e PP : ×2.
 */
// Règle EP : si (aptBase + bonus + ppInvest) > 60 → 2 PP/pt au-delà
function _ppCost(ppInvest, aptBase, bonus = 0) {
  if (ppInvest <= 0) return 0;
  const threshold = Math.max(0, 60 - (aptBase || 0) - (bonus || 0));
  const base = Math.min(ppInvest, threshold);
  const over = Math.max(0, ppInvest - threshold);
  return base + over * 2;
}

export class CharacterCreator extends Application {

  constructor(options = {}) {
    super(options);
    this.currentStep = 0;
    this.data = _defaultData();
    this.morphesList = [];
    this.aspectsList = [];
    this.data.aspects_choisis = []; // [{id, nom, cout_pp, type}]
    this._loadMorphes();
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id:       "ep-character-creator",
      title:    "⚡ Création de Personnage — Eclipse Phase",
      template: "systems/eclipse-phase/templates/apps/character-creator.html",
      width:    880,
      height:   700,
      resizable: true,
      classes:  ["eclipse-phase","ep-creator"],
    });
  }

  // Sauvegarde la position de scroll avant re-rendu
  async _render(force, options) {
    const body = this.element?.find?.(".ep-wiz-body");
    this._savedScroll = body?.scrollTop?.() ?? 0;
    await super._render(force, options);
  }

  async _loadMorphes() {
    try {
      const pack = game.packs.get("eclipse-phase.morphes");
      if (pack) {
        await pack.getIndex();
        this.morphesList = (await pack.getDocuments()).sort((a,b)=>a.name.localeCompare(b.name,"fr"));
      }
    } catch(e) { console.warn("EP Creator: morphes non chargés", e); }
    await this._loadAspects();
  }

  async _loadAspects() {
    try {
      const pack = game.packs.get("eclipse-phase.aspects");
      if (pack) {
        await pack.getIndex();
        this.aspectsList = (await pack.getDocuments()).sort((a,b)=>a.name.localeCompare(b.name,"fr"));
      } else {
        this.aspectsList = [];
      }
    } catch(e) { console.warn("EP Creator: aspects non chargés", e); this.aspectsList = []; }
    // Les compendiums se chargent en async : rafraîchir la fenêtre si déjà affichée
    if (this.rendered) this.render(false);
  }

  _getTemplate() {
    return game.system.id
      ? "systems/eclipse-phase/templates/apps/character-creator.html"
      : this.options.template;
  }

  // ── Calculs PP ────────────────────────────────────────────────
  _ppSpentActives() {
    let total = 0;
    const slots = this._resolveFixedBonusSlots();
    for (const [key, ppInvest] of Object.entries(this.data.sk_actives)) {
      const apt     = this._getSkApt(key, "actives");
      const aptBase = this.data.apts[apt] || 15;
      const bonus   = (slots[key]?.val || 0) + this._getBonusLibreForKey(key);
      total += _ppCost(ppInvest || 0, aptBase, bonus);
    }
    return total;
  }
  _ppSpentConnais() {
    let total = 0;
    for (const [key, ppInvest] of Object.entries(this.data.sk_connais)) {
      const apt = this._getSkApt(key, "connaissances");
      const aptBase = this.data.apts[apt] || 15;
      total += _ppCost(ppInvest || 0, aptBase);
    }
    return total;
  }
  _getSkApt(key, category) {
    // Accès rapide à l'aptitude d'une compétence via les données statiques
    const tpl = category === "actives" ? this._activesTemplate() : this._connaisTemplate();
    return tpl[key]?.aptitude || "cog";
  }
  _activesTemplate() { return ACTIVES_TPL; }
  _connaisTemplate() { return CONNAIS_TPL; }
  _ppAudace() { return Math.max(0, (this.data.audace - 1)) * 15; }
  _repGratuits() {
    // 50 points de départ, réduits par le malus d'historique (ex : Rescapé de la Chute −10)
    const hist = HISTORIQUES.find(h => h.id === this.data.historique);
    return 50 - (hist?.rep_malus || 0);
  }
  _ppRep()    {
    // Les premiers points de réputation sont GRATUITS (points de départ) ; au-delà 1 PP = 10 pts
    const total = Object.values(this.data.reps).reduce((s,v)=>s+(v||0),0);
    return Math.max(0, Math.floor((total - this._repGratuits()) / 10));
  }
  _ppCred()   { return Math.floor((this.data.credits_bonus||0)/1000); }
  _ppMorphe() {
    if (!this.data.morphe_id) return 0;
    const m = this.morphesList.find(m=>m._id===this.data.morphe_id||m.id===this.data.morphe_id);
    return m ? (m.system.cout_pp||0) : 0;
  }
  _ppAspects() {
    // positif: +cout_pp (dépensé) | negatif: cout_pp stocké négatif (récupéré)
    return (this.data.aspects_choisis||[]).reduce((s,a)=>s+(a.cout_pp||0),0);
  }
  _ppNegAspects() {
    // PP récupérés via aspects négatifs (valeur absolue)
    return (this.data.aspects_choisis||[])
      .filter(a=>a.type==="negatif")
      .reduce((s,a)=>s+Math.abs(a.cout_pp||0),0);
  }
  _ppLeft()   {
    return 1000 - this._ppSpentActives() - this._ppSpentConnais()
                - this._ppAudace() - this._ppRep() - this._ppCred()
                - this._ppMorphe() - this._ppAspects();
  }
  _aptTotal() {
    return Object.values(this.data.apts).reduce((s,v)=>s+(v||0),0);
  }

  // ── Données pour le template ───────────────────────────────────
  getData() {
    // Données statiques du template.json — évite la dépendance à game.system.model en v13
    const actives_template = ACTIVES_TPL;
    const connais_template = CONNAIS_TPL;

    const aptitudes = APT_KEYS.map(k => ({
      key: k, nom: APT_NOMS[k], abr: APT_ABRS[k],
      hint: APT_HINTS[k], value: this.data.apts[k] || 15,
    }));

    const intVal = this.data.apts.int || 15;

    // Compétences actives enrichies
    const competences_actives = Object.entries(actives_template)
      .map(([key,sk]) => {
        const apt = sk.aptitude || "cog";
        const aptBase = this.data.apts[apt] || 15;
        const ppInvest     = this.data.sk_actives[key] || 0;
        const bonusHistFact = this._getBonusHistFact(key, "actives");
        const total         = aptBase + ppInvest + bonusHistFact;
        const maxPP         = Math.max(0, 80 - aptBase); // max total 80 (bonus gratuit non compté)
        const ppCout        = _ppCost(ppInvest, aptBase, bonusHistFact);
        // Pour les slots réseau, récupérer le nom depuis bonus_fixes ou bonus_libres
        const nomActif = key.startsWith("reseau_")
          ? (this._getReseauNom(key) || sk.nom || "")
          : (this.data.sk_noms_actives?.[key] || sk.nom || "");
        return { key, nom: nomActif, placeholder:sk.placeholder||"", aptitude:apt,
                 aptAbr:APT_ABRS[apt]||"?", aptBase, ppInvest, total, maxPP, ppCout,
                 bonusHistFact };
      })
      .sort((a,b)=>(a.nom||a.placeholder||"").localeCompare(b.nom||b.placeholder||"","fr"));

    const competences_connaissances = Object.entries(connais_template)
      .map(([key,sk]) => {
        const apt = sk.aptitude || "cog";
        const aptBase = this.data.apts[apt] || 15;
        const ppInvest = this.data.sk_connais[key] || 0;
        const total    = aptBase + ppInvest;
        const maxPP    = Math.max(0, 80 - aptBase);
        const ppCout   = _ppCost(ppInvest, aptBase, 0);
        return { key, nom: this.data.sk_noms_connais[key]||"",
                 placeholder:sk.placeholder||"Art / Intérêt / Langue / Profession / Théorie",
                 aptitude:apt, aptAbr:APT_ABRS[apt]||"?", aptBase, ppInvest, total, maxPP, ppCout };
      });

    const reps = RESEAUX.map(r => ({...r, value: this.data.reps[r.key]||0}));
    const histObj = HISTORIQUES.find(h=>h.id===this.data.historique);
    const factObj = FACTIONS.find(f=>f.id===this.data.faction);
    const ppLeft = this._ppLeft();

    return {
      currentStep: this.currentStep,
      steps: [
        {label:"Concept",      done:!!this.data.nom},
        {label:"Historique",   done:!!this.data.historique},
        {label:"Faction",      done:!!this.data.faction},
        {label:"Aptitudes",    done:this._aptTotal()===105},
        {label:"Actives",      done:this._ppSpentActives()>=400},
        {label:"Connaissances", done:this._ppSpentConnais()>=300},
        {label:"Aspects",      done:true},
        {label:"PP divers",    done:true},
        {label:"Terminer",     done:false},
      ],
      data: this.data,
      historiques: HISTORIQUES,
      factions:    FACTIONS,
      aptitudes,
      aptRemaining: 105 - this._aptTotal(),
      langNatale: 70 + intVal,
      ppLeft,
      ppNeg: ppLeft < 0,
      ppSpentActives: this._ppSpentActives(),
      ppSpentConnais: this._ppSpentConnais(),
      ppRep:  this._ppRep(),
      ppCred: this._ppCred(),
      ppMorphe: this._ppMorphe(),
      audCost: this._ppAudace(),
      competences_actives,
      competences_connaissances,
      morphes: this.morphesList,
      aspects_pos: (this.aspectsList||[]).filter(a=>a.system?.type_aspect==="positif"),
      aspects_neg: (this.aspectsList||[]).filter(a=>a.system?.type_aspect==="negatif"),
      aspects_choisis: this.data.aspects_choisis||[],
      reps,
      repGratuitsMax: this._repGratuits(),
      repGratuits: Math.min(this._repGratuits(), Object.values(this.data.reps).reduce((s,v)=>s+(v||0),0)),
      repGratuitOk: Object.values(this.data.reps).reduce((s,v)=>s+(v||0),0) <= this._repGratuits(),
      repGratuitsRestants: Math.max(0, this._repGratuits() - Object.values(this.data.reps).reduce((s,v)=>s+(v||0),0)),
      histNom: histObj?.nom || "—",
      factNom: factObj?.nom || "—",
      bonus_libres_pending: (() => { try { return this._getBonusLibresPending(); } catch(e) { console.error("EP Creator bonus libres:", e); return []; } })(),
      bonus_libres: this.data.bonus_libres || [],
      actOk:     this._ppSpentActives() >= 400,
      conOk:     this._ppSpentConnais() >= 300,
      ppAspects: this._ppAspects(),
    };
  }

  /**
   * Résout les slots pour les bonus_fixes de l'historique + faction.
   * Si deux sources ciblent le même slot avec des labels différents,
   * la seconde est déplacée sur le slot suivant disponible.
   * Retourne : { key: {val, label} }
   */
  _resolveFixedBonusSlots() {
    const result = {};
    const hist = HISTORIQUES.find(h => h.id === this.data.historique);
    const fact = FACTIONS.find(f => f.id === this.data.faction);

    for (const obj of [hist, fact]) {
      for (const b of (obj?.bonus_fixes || [])) {
        const origKey = b.sk;
        const label   = b.label || "";
        const val     = b.val   || 0;

        if (!result[origKey]) {
          result[origKey] = { val, label };
        } else if (result[origKey].label === label) {
          // Même label (même réseau/compétence) → cumuler sur le même slot
          result[origKey].val += val;
        } else {
          // Label différent → trouver le prochain slot libre du même type
          const base = origKey.replace(/_\d+$/, "_");
          let placed = false;
          for (let i = 2; i <= 4; i++) {
            const alt = base + i;
            if (!result[alt]) {
              result[alt] = { val, label };
              placed = true;
              break;
            } else if (result[alt].label === label) {
              result[alt].val += val;
              placed = true;
              break;
            }
          }
          if (!placed) result[origKey].val += val; // fallback
        }
      }
    }
    return result;
  }


  _getBonusHistFact(key, category) {
    // Utiliser les slots RÉSOLUS (pas les clés brutes de bonus_fixes)
    // car un bonus pour reseau_1 peut être déplacé sur reseau_2 par le résolveur
    const slots = this._resolveFixedBonusSlots();
    let total = (slots[key]?.val || 0);
    total += this._getBonusLibreForKey(key);
    return total;
  }

  // Retourne le nom à afficher pour un slot réseau (depuis bonus_fixes, libres, ou saisie)
  _getReseauNom(key) {
    const slots = this._resolveFixedBonusSlots();
    // Priorité 1 : bonus_fixes (toujours autoritaire sur le nom du slot)
    if (slots[key]?.label) return `Réseau : ${slots[key].label}`;
    // Priorité 2 : bonus_libres choisis
    const libre = (this.data.bonus_libres||[]).find(bl => bl.chosen_key === key && bl.chosen_nom);
    if (libre) return `Réseau : ${libre.chosen_nom}`;
    // Priorité 3 : saisie manuelle (seulement si pas de bonus fixe sur ce slot)
    if (this.data.sk_noms_actives?.[key]) return this.data.sk_noms_actives[key];
    return "";
  }


  // Calcule le bonus historique/faction pour une compétence par son nom court
  _getBonusForSkillKey(key) {
    const tpl = this._activesTemplate();
    const sk = tpl[key];
    if (!sk) return 0;
    return this._getBonusHistFact(key, "actives");
  }

  // Retourne les bonus "au choix" non encore assignés avec la liste filtrée
  _getBonusLibresPending() {
    const pending = [];
    const hist = HISTORIQUES.find(h => h.id === this.data.historique);
    const fact = FACTIONS.find(f => f.id === this.data.faction);
    const actTpl = ACTIVES_TPL;
    const conTpl = CONNAIS_TPL;
    const abrs   = {cog:"COG",coo:"COO",int:"INT",ref:"RÉF",ast:"AST",som:"SOM",vol:"VOL"};
    const ALIASES = { technique: "materiel" };

    // Suggestions réseau (pour le datalist)
    const RESEAU_SUGGESTIONS = [
      "Autonomistes (@-rép)","Hypercorps (c-rép)","Écologistes (e-rép)",
      "Médias (f-rép)","Criminels (g-rép)","Firewall (i-rép)","Scientifiques (r-rép)"
    ];

    let idx = 0;
    for (const [source, obj] of [["hist", hist], ["fact", fact]]) {
      for (const b of (obj?.bonus_libres || [])) {
        const id = `${source}_${idx++}`;
        const already = (this.data.bonus_libres||[]).find(bl => bl.id === id);
        const isReseau = (b.choices||[]).some(c => c.startsWith("reseau_"));

        let skillOptions = [];

        if (!isReseau) {
          // ── Compétences non-réseau ──────────────────────────────────────────
          if (b.choices && b.choices.length > 0) {
            const allTpl = {...actTpl, ...conTpl};
            for (const rawChoice of b.choices) {
              const choice = ALIASES[rawChoice] || rawChoice;
              if (allTpl[choice]) {
                // Clé directe
                const sk  = allTpl[choice];
                const nom = sk.nom || sk.placeholder?.replace(" : ...","").replace("...","").trim() || choice;
                skillOptions.push({ key: choice, label: nom, apt: abrs[sk.aptitude]||"" });
              } else {
                // Préfixe : toutes les clés commençant par choice_
                let slotNum = 1;
                for (const [key, sk] of Object.entries({...actTpl, ...conTpl})) {
                  if (key.startsWith(choice + "_") || key === choice) {
                    const base = sk.nom || sk.placeholder?.replace(" : ...","").replace("...","").trim() || choice;
                    skillOptions.push({ key, label: `${base} ${slotNum++}`, apt: abrs[sk.aptitude]||"" });
                  }
                }
              }
            }
          } else if (b.type === "connaissance") {
            const filter = (b.placeholder||"").toLowerCase();
            let slotNum = 1;
            for (const [key, sk] of Object.entries(conTpl)) {
              const ph = (sk.placeholder||"").toLowerCase();
              if (!filter || ph.startsWith(filter)) {
                const base = sk.placeholder?.replace(" : ...","").replace("...","").trim() || key;
                skillOptions.push({ key, label: `${base} ${slotNum++}`, apt: abrs[sk.aptitude]||"" });
              }
            }
          } else {
            // Toutes les actives
            for (const [key, sk] of Object.entries(actTpl)) {
              const nom = sk.nom || sk.placeholder?.replace(" : ...","").replace("...","").trim() || key;
              skillOptions.push({ key, label: nom, apt: abrs[sk.aptitude]||"" });
            }
          }
          skillOptions.sort((a, b) => a.label.localeCompare(b.label, "fr"));
        }

        pending.push({
          id, source, sourceNom: obj.nom,
          val: b.val,
          type: b.type || "active",
          label: b.label || `+${b.val} au choix`,
          is_reseau: isReseau,
          reseau_suggestions: isReseau ? RESEAU_SUGGESTIONS : [],
          skillOptions: isReseau ? [] : skillOptions,
          chosen_key: already?.chosen_key || "",
          chosen_nom: already?.chosen_nom || "",
        });
      }
    }
    return pending;
  }
  // Retourne le bonus libre assigné pour une clé de compétence
  _getBonusLibreForKey(key) {
    return (this.data.bonus_libres||[])
      .filter(bl => bl.chosen_key === key)
      .reduce((s,bl) => s + (bl.val||0), 0);
  }

  // ── Listeners ─────────────────────────────────────────────────
  activateListeners(html) {
    // Restaurer la position de scroll après re-rendu
    if (this._savedScroll) {
      html.find(".ep-wiz-body").scrollTop(this._savedScroll);
      this._savedScroll = 0;
    }

    super.activateListeners(html);

    // Navigation étapes
    html.find(".ep-wiz-next").on("click", () => this._nextStep());
    html.find(".ep-wiz-prev").on("click", () => this._prevStep());
    html.find(".ep-wiz-step-btn").on("click", ev => {
      const s = parseInt(ev.currentTarget.dataset.step);
      this.currentStep = s;
      this.render(false);
    });
    html.find(".ep-wiz-create").on("click", () => this._createActor());

    // Aptitudes
    html.find(".ep-apt-minus").on("click", ev => {
      const k = ev.currentTarget.dataset.apt;
      if ((this.data.apts[k]||15) > 5) {
        this.data.apts[k] = (this.data.apts[k]||15) - 1;
        this.render(false);
      }
    });
    html.find(".ep-apt-plus").on("click", ev => {
      const k = ev.currentTarget.dataset.apt;
      if ((this.data.apts[k]||15) < 30 && this._aptTotal() < 105) {
        this.data.apts[k] = (this.data.apts[k]||15) + 1;
        this.render(false);
      }
    });
    html.find(".ep-apt-input").on("change", ev => {
      const k = ev.currentTarget.dataset.apt;
      const v = Math.max(5, Math.min(30, parseInt(ev.currentTarget.value)||15));
      this.data.apts[k] = v;
      this.render(false);
    });

    // Compétences PP
    html.find(".ep-sk-minus").on("click", ev => {
      const key = ev.currentTarget.dataset.key;
      const cat = ev.currentTarget.closest("[data-category]")?.dataset.category;
      const store = cat==="actives" ? this.data.sk_actives : this.data.sk_connais;
      if ((store[key]||0) >= 5) { store[key] = (store[key]||0) - 5; this.render(false); }
    });
    html.find(".ep-sk-plus2").on("click", ev => {
      const key = ev.currentTarget.dataset.key;
      const cat = ev.currentTarget.closest("[data-category]")?.dataset.category;
      const store = cat==="actives" ? this.data.sk_actives : this.data.sk_connais;
      const cur   = store[key] || 0;
      const apt   = this._getSkApt(key, cat);
      const aptBase = this.data.apts[apt] || 15;
      const maxPP = Math.max(0, 80 - aptBase); // total max 80
      if (cur < maxPP && this._ppLeft() > 0) {
        store[key] = Math.min(cur + 5, maxPP);
        this.render(false);
      }
    });
    html.find(".ep-sk-pp-inp").on("change", ev => {
      const key = ev.currentTarget.dataset.key;
      const cat = ev.currentTarget.closest("[data-category]")?.dataset.category;
      const store = cat==="actives" ? this.data.sk_actives : this.data.sk_connais;
      store[key] = Math.max(0, Math.min(60, parseInt(ev.currentTarget.value)||0));
      this.render(false);
    });

    // Noms des compétences
    html.find(".ep-sk-nom-inp").on("change", ev => {
      const name = ev.currentTarget.name;
      const cat = ev.currentTarget.closest("[data-category]")?.dataset.category;
      if (name.startsWith("sk_nom_")) {
        const key = name.replace("sk_nom_","");
        if (cat==="actives") this.data.sk_noms_actives[key] = ev.currentTarget.value;
        else this.data.sk_noms_connais[key] = ev.currentTarget.value;
      }
    });

    // Radios historique/faction
    html.find("[name='historique']").on("change", ev => {
      this.data.historique = ev.currentTarget.value;
      this.render(false);
    });
    html.find("[name='faction']").on("change", ev => {
      this.data.faction = ev.currentTarget.value;
      this.render(false);
    });

    // Audace
    html.find("#aud-minus").on("click", () => {
      if (this.data.audace > 1) { this.data.audace--; this.render(false); }
    });
    html.find("#aud-plus").on("click", () => {
      if (this.data.audace < 10 && this._ppLeft() >= 15) { this.data.audace++; this.render(false); }
    });

    // Réputation (plafond : 35 PP au-delà des points gratuits)
    html.find(".ep-rep-inp").on("change", ev => {
      const k = ev.currentTarget.dataset.rep;
      const avant = this.data.reps[k] || 0;
      this.data.reps[k] = Math.max(0, Math.min(80, parseInt(ev.currentTarget.value)||0));
      if (this._ppRep() > 35) {
        this.data.reps[k] = avant;
        ui.notifications.warn("Maximum 35 PP en réputation supplémentaire.");
      }
      this.render(false);
    });

    // Crédits bonus
    html.find("[name='credits_bonus']").on("change", ev => {
      const v = Math.max(0, Math.min(100000, parseInt(ev.currentTarget.value)||0));
      this.data.credits_bonus = Math.floor(v/1000)*1000;
      this.render(false);
    });

    // Morphe
    html.find(".ep-morphe-sel").on("change", ev => {
      this.data.morphe_id = ev.currentTarget.value;
      this.render(false);
    });

    // Bonus libres — sélection compétence classique
    html.find(".ep-bonus-libre-sel").on("change", ev => {
      const id  = ev.currentTarget.dataset.id;
      const val = parseInt(ev.currentTarget.dataset.val) || 0;
      const key = ev.currentTarget.value;
      if (!key) return;
      const tpl = {...ACTIVES_TPL, ...CONNAIS_TPL};
      const sk  = tpl[key];
      const nom = sk?.nom || sk?.placeholder?.replace(" : ...","").trim() || key;
      if (!this.data.bonus_libres) this.data.bonus_libres = [];
      const existing = this.data.bonus_libres.find(bl => bl.id === id);
      if (existing) { existing.chosen_key = key; existing.chosen_nom = nom; }
      else { this.data.bonus_libres.push({id, val, chosen_key: key, chosen_nom: nom}); }
      this.render(false);
    });

    // Bonus libres — saisie libre réseau
    html.find(".ep-bl-reseau-inp").on("change", ev => {
      const id  = ev.currentTarget.dataset.id;
      const val = parseInt(ev.currentTarget.dataset.val) || 0;
      const nom = ev.currentTarget.value.trim();
      if (!nom) return;
      if (!this.data.bonus_libres) this.data.bonus_libres = [];
      // Slots déjà pris par les bonus_fixes
      const fixedSlots = this._resolveFixedBonusSlots();
      const fixedKeys  = Object.keys(fixedSlots).filter(k => k.startsWith("reseau_"));
      // Slots pris par d'autres bonus libres
      const usedByLibres = (this.data.bonus_libres||[])
        .filter(bl => bl.id !== id && bl.chosen_key?.startsWith("reseau_"))
        .map(bl => bl.chosen_key);
      // Même nom déjà assigné → même slot
      const sameSlot = (this.data.bonus_libres||[]).find(bl => bl.id !== id && bl.chosen_nom === nom);
      // Premier slot réseau libre (pas pris par bonus_fixes ni autres libres)
      const slot = sameSlot?.chosen_key
        || ["reseau_1","reseau_2","reseau_3","reseau_4"]
           .find(k => !fixedKeys.includes(k) && !usedByLibres.includes(k))
        || ["reseau_1","reseau_2","reseau_3","reseau_4"]
           .find(k => !usedByLibres.includes(k))
        || "reseau_1";
      const existing = this.data.bonus_libres.find(bl => bl.id === id);
      if (existing) { existing.chosen_key = slot; existing.chosen_nom = nom; }
      else { this.data.bonus_libres.push({id, val, chosen_key: slot, chosen_nom: nom}); }
      // Remplir le nom du slot dans sk_noms_actives
      if (!this.data.sk_noms_actives) this.data.sk_noms_actives = {};
      this.data.sk_noms_actives[slot] = `Réseau : ${nom}`;
      this.render(false);
    });

    // Aspects — ajouter
    html.find(".ep-asp-add-btn").on("click", ev => {
      const btn  = ev.currentTarget;
      const id   = btn.dataset.id;
      const nom  = btn.dataset.nom;
      const cout = parseInt(btn.dataset.cout) || 0;
      const type = btn.dataset.type;
      if (!this.data.aspects_choisis) this.data.aspects_choisis = [];
      if (this.data.aspects_choisis.find(a=>a.id===id)) return; // déjà choisi
      // Vérifier max 50 PP d'aspects négatifs
      if (type === "negatif") {
        const ppNeg = this.data.aspects_choisis.filter(a=>a.type==="negatif").reduce((s,a)=>s+a.cout_pp,0);
        if (ppNeg + cout > 50) { ui.notifications.warn("Maximum 50 PP d'aspects négatifs."); return; }
        this.data.aspects_choisis.push({id, nom, cout_pp: -cout, type}); // PP négatif = bonus
      } else {
        if (this._ppLeft() < cout) { ui.notifications.warn("Pas assez de PP."); return; }
        this.data.aspects_choisis.push({id, nom, cout_pp: cout, type});
      }
      this.render(false);
    });

    // Aspects — retirer
    html.find(".ep-asp-remove-btn").on("click", ev => {
      const id = ev.currentTarget.dataset.id;
      this.data.aspects_choisis = (this.data.aspects_choisis||[]).filter(a=>a.id!==id);
      this.render(false);
    });

    // Motivations & nom/concept
    html.find("[name='nom']").on("input", ev => this.data.nom = ev.currentTarget.value);
    html.find("[name='concept']").on("input", ev => this.data.concept = ev.currentTarget.value);
    html.find("[name='motiv1']").on("input", ev => this.data.motiv1 = ev.currentTarget.value);
    html.find("[name='motiv2']").on("input", ev => this.data.motiv2 = ev.currentTarget.value);
    html.find("[name='motiv3']").on("input", ev => this.data.motiv3 = ev.currentTarget.value);
  }

  _nextStep() { if (this.currentStep < 8) { this.currentStep++; this.render(false); } }
  _prevStep() { if (this.currentStep > 0) { this.currentStep--; this.render(false); } }

  // ── Création de l'acteur ───────────────────────────────────────
  async _createActor() {
    if (!this.data.nom) { ui.notifications.warn("Veuillez donner un nom au personnage."); return; }
    if (this._ppLeft() < 0) {
      const ok = await Dialog.confirm({title:"PP négatifs",content:"<p>Vous avez dépensé plus de 1000 PP. Créer quand même ?</p>"});
      if (!ok) return;
    }

    // Données statiques du template.json
    const actives_template_c = ACTIVES_TPL;
    const connais_template_c = CONNAIS_TPL;
    // Calculer les bonus historique/faction
    const hist = HISTORIQUES.find(h => h.id === this.data.historique);
    const fact = FACTIONS.find(f => f.id === this.data.faction);

    // Construire competences_actives en JSON pur (évite les limites DataModel Foundry v13)
    const fixedSlots = this._resolveFixedBonusSlots();
    const competences_actives_built = {};
    for (const [key, sk] of Object.entries(actives_template_c)) {
      // Utiliser les slots résolus (gère les déplacements de slots)
      let bonusMorphe = (fixedSlots[key]?.val || 0);
      bonusMorphe += (this.data.bonus_libres||[])
        .filter(bl => bl.chosen_key === key)
        .reduce((s, bl) => s + (bl.val || 0), 0);

      // bonus_hist = permanent (hist/faction), bonus_morphe = morphe (conditionnel)
      competences_actives_built[key] = {
        ...sk,
        base:         this.data.sk_actives[key]       || 0,
        bonus_hist:   bonusMorphe,   // les bonus du wizard sont des bonus H/F permanents
        bonus_morphe: 0,             // le morphe sera appliqué séparément
        nom:          (() => {
          // Nom depuis les slots résolus (priorité aux bonus_fixes)
          if (key.startsWith("reseau_") && fixedSlots[key]?.label)
            return `Réseau : ${fixedSlots[key].label}`;
          if (key.startsWith("pilotage_") && fixedSlots[key]?.label)
            return `Pilotage : ${fixedSlots[key].label}`;
          if (key.startsWith("materiel_") && fixedSlots[key]?.label)
            return `Matériel : ${fixedSlots[key].label}`;
          // Bonus libre choisi
          const libre = (this.data.bonus_libres||[]).find(bl => bl.chosen_key === key && bl.chosen_nom);
          if (libre) {
            const prefix = key.startsWith("reseau_") ? "Réseau" : key.startsWith("pilotage_") ? "Pilotage" : "";
            return prefix ? `${prefix} : ${libre.chosen_nom}` : libre.chosen_nom;
          }
          return this.data.sk_noms_actives?.[key] || sk.nom || "";
        })(),
        specialisation: sk.specialisation || "",
      };
    }

    // Construire competences_connaissances
    const competences_connaissances_built = {};
    for (const [key, sk] of Object.entries(connais_template_c)) {
      competences_connaissances_built[key] = {
        ...sk,
        base: this.data.sk_connais[key]     || 0,
        nom:  this.data.sk_noms_connais[key] || sk.nom || "",
      };
    }

    // Construire les aptitudes
    const aptitudes_built = {};
    for (const k of APT_KEYS) {
      aptitudes_built[k] = { base: this.data.apts[k] || 15, morphe: 0, divers: 0 };
    }

    // actorData = objet JSON pur passé directement à Actor.create
    const actorData = {
      aptitudes:                aptitudes_built,
      competences_actives:      competences_actives_built,
      competences_connaissances: competences_connaissances_built,
    };

    // Audace, réputation, biographie
    actorData.stats = { aud: { value: this.data.audace, max: this.data.audace, points: this.data.audace } };

    actorData.reputation = {};
    for (const r of RESEAUX) actorData.reputation[r.key] = { value: this.data.reps[r.key] || 0 };

    actorData.biographie = {};
    actorData.biographie.historique = this.data.historique;
    actorData.biographie.faction    = this.data.faction;
    actorData.biographie.motivations = [this.data.motiv1,this.data.motiv2,this.data.motiv3].filter(Boolean).join(" / ");
    actorData.biographie.concept    = this.data.concept || "";

    // Aspects gratuits accordés par l'historique (ex : Égarés → Psi niveau 1)
    const aspectsGratuits = hist?.bonus_aspects || [];
    if (aspectsGratuits.length) {
      actorData.aspects = { positifs: aspectsGratuits.map(a => `${a} (historique, gratuit)`).join(" · "), negatifs: "" };
    }

    // Crédits
    const histObj = HISTORIQUES.find(h=>h.id===this.data.historique);
    const creditBase = histObj?.credits !== undefined ? histObj.credits : 5000;
    actorData.biographie.credits = creditBase + (this.data.credits_bonus||0);

    // Créer l'acteur
    const actor = await Actor.create({
      name:   this.data.nom,
      type:   "character",
      system: actorData,
    });

    // Appliquer le morphe si sélectionné.
    // La création de l'item embarqué déclenche EclipsePhaseItem._applyMorpheBonuses
    // (aptitudes, END, armure intrinsèque, mobilité, etc.) — pas de double application ici.
    if (this.data.morphe_id && actor) {
      const morpheItem = this.morphesList.find(m=>m._id===this.data.morphe_id||m.id===this.data.morphe_id);
      if (morpheItem) {
        await actor.createEmbeddedDocuments("Item",[morpheItem.toObject()]);
      }
    }

    // Ajouter les aspects sélectionnés
    if (this.data.aspects_choisis?.length && actor) {
      for (const ac of this.data.aspects_choisis) {
        const aspItem = (this.aspectsList||[]).find(a=>a._id===ac.id||a.id===ac.id);
        if (aspItem) await actor.createEmbeddedDocuments("Item",[aspItem.toObject()]);
      }
    }

    ui.notifications.info(`✓ ${this.data.nom} créé avec succès !`);
    actor.sheet.render(true);
    this.close();
  }
}
