import {
  ObjectCriteria,
  PredicateObjectPair,
  SparnaturalQuery,
  TermTypedVariable,
} from "../../../SparnaturalQueryIfc-v13";

export type SparnaturalQueryV13Visitor = {
  subject?: (subject: TermTypedVariable) => void;
  predicateObjectPair?: (pair: PredicateObjectPair) => void;
  objectCriteria?: (obj: ObjectCriteria) => void;
};

export class SparnaturalQueryTraversalV13 {
  static traverse(query: SparnaturalQuery, visitor: SparnaturalQueryV13Visitor) {
    if (!query || !query.where) return;

    const where = query.where;

    if (visitor.subject && where.subject) {
      visitor.subject(where.subject);
    }

    const walkPair = (pair: PredicateObjectPair) => {
      if (!pair) return;
      if (visitor.predicateObjectPair) visitor.predicateObjectPair(pair);

      const obj = pair.object;
      if (obj && visitor.objectCriteria) visitor.objectCriteria(obj);

      const children = obj?.predicateObjectPairs;
      if (children && Array.isArray(children)) {
        children.forEach(walkPair);
      }
    };

    const pairs = where.predicateObjectPairs;
    if (pairs && Array.isArray(pairs)) {
      pairs.forEach(walkPair);
    }
  }
}

export default SparnaturalQueryTraversalV13;
