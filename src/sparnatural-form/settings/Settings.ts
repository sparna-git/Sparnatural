import ISettings from "./ISettings";

// Configuration par défaut
export const defaultSettings: ISettings = {
  src: null, // Aucun src par défaut
  language: "en", // Langue par défaut en anglais
  defaultLanguage: "en", // Langue par défaut en anglais
  query: "", // Requête vide par défaut
  form: "", // Formulaire vide par défaut
  limit: -1,
  debug: false,
  typePredicate: "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>", // Type prédicat par défaut
  endpoints: [], // Aucun endpoint par défaut
  submitButton: true,
  sparqlPrefixes: {
    rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    rdfs: "http://www.w3.org/2000/01/rdf-schema#",
    xsd: "http://www.w3.org/2001/XMLSchema#",
  },
  customization: {
    headers: new Map(), // Pas de headers par défaut
    autocomplete: {}, // Configuration autocomplete vide par défaut
    list: {}, // Configuration liste vide par défaut
    tree: {}, // Configuration arbre vide par défaut
    number: {}, // Configuration nombre vide par défaut
    map: {}, // Configuration carte vide par défaut
  },
  catalog: null,
  localCacheDataTtl: 1000 * 60 * 60 * 24, // 24 hours in mimmiseconds
};

// Fonction pour étendre les objets en profondeur
export const extend = (
  deep: boolean,
  target: { [key: string]: any },
  ...src: Array<{ [key: string]: any }>
) => {
  if (target === undefined) target = {};
  // Fonction de fusion
  var merge = function (obj: { [key: string]: any }) {
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue;
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Si fusion profonde et que la propriété est un objet, fusionner les propriétés
        if (
          deep &&
          Object.prototype.toString.call(value) === "[object Object]"
        ) {
          target[key] = extend(true, target[key], obj[key]);
        } else {
          target[key] = obj[key];
        }
      }
    }
  };
  // Boucler à travers chaque objet et effectuer une fusion
  src.forEach((o) => {
    merge(o);
  });

  return target;
};
