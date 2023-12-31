import { LABEL_ORDER } from './constants'
import { type Label } from './db'

export function sortLabels (labels: Label[]): Label[] {
  const knownLabels = labels.reduce((map, label) => {
    map.set(label.label.toLowerCase(), label)
    return map
  }, new Map())

  return LABEL_ORDER.map<Label>(label => {
    if (knownLabels.has(label)) {
      const orderedLabel = knownLabels.get(label)
      knownLabels.delete(label)
      return orderedLabel
    }
    return null
  })
    .filter(item => item !== null)
    .concat([...knownLabels.values()])
}
