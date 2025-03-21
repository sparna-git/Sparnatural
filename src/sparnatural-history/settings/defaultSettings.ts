import { Props } from "tippy.js";
import ISettings from "./ISettings";

const defaultSettings: ISettings = {
  language: "fr",
  defaultLanguage: "fr",
};

// the actual settings, result of merge between defaultSettings and settings passed as parameters
let settings: ISettings = {
  language: "",
  defaultLanguage: "",
};
export function getSettings() {
  return settings;
}

// merge given options with default setting values
export function mergeSettings(options: ISettings) {
  // note how settings is used also as starting object so that properties
  // that were set are preserved if display is called again
  settings = extend(true, settings, defaultSettings, options) as ISettings;
}

// Pass in the objects to merge as arguments.
// For a deep extend, set the first argument to `true`.
const extend = (
  deep: boolean,
  target: { [key: string]: any },
  ...src: Array<{ [key: string]: any }>
) => {
  if (target === undefined) target = {};
  // Merge the object into the target object
  var merge = function (obj: { [key: string]: any }) {
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue;
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // If deep merge and property is an object, merge properties
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
  // Loop through each object and conduct a merge
  src.forEach((o) => {
    merge(o);
  });

  return target;
};

/*
// tooltip configs are constant
export const TOOLTIP_CONFIG: Partial<Props> = {
  allowHTML: true,
  plugins: [] as any[],
  placement: "right-start",
  offset: [5, 5],
  theme: "sparnatural",
  arrow: false,
  delay: [800, 100], //Delay in ms once a trigger event is fired before a tippy shows or hides.
  duration: [200, 200], //Duration in ms of the transition animation.
};
*/
