export const FIELD_SET = 'FIELD_SET'

/**
 * set the value of the variable field
 * @param {object} field has name for variable name, value for the new value, isFileInput flag to indicate if the variable belong to taskFields or fileFields
 */
export default function set_field(field) {
  return { type: FIELD_SET, field }
}