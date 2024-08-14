import * as jsonQuery from '../lib/jsonquery.js';
import * as objectExtractor from '../lib/objectExtractor.js';

export function cdlDoc (json, prettyPrint) {
    if (prettyPrint) {
        console.log(JSON.stringify(json, null, 2))
    } else {
        console.log(JSON.stringify(json))
    }
}

/**
 * Returns the elements of a JSON object whose keys are included in the array argument.
 *
 * @param {Object} jsonObject - The JSON object to filter.
 * @param {Array} keysArray - The array of keys to include.
 * @returns {Object} A new JSON object with only the specified keys.
 */
function filterJsonObject(jsonObject, keysArray) {
    let filteredObject = {};
    keysArray.forEach(key => {
      if (jsonObject.hasOwnProperty(key)) {
        filteredObject[key] = jsonObject[key];
      }
    });
    return filteredObject;
  }