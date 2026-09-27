import * as fs from 'fs';
import * as path from 'path';
import { traqulaIndentation } from '@traqula/core';
import { Generator } from '@traqula/generator-sparql-1-1';
import { Parser } from '@traqula/parser-sparql-1-1';
import { AstFactory, Pattern, QuerySelect } from '@traqula/rules-sparql-1-1';
import SparqlFactoryV13 from '../../sparnatural/generators/sparql/fromjsonv13/SparqlFactoryV13';
import { SparqlGeneratorV13, addComment, withMetadata } from '../../sparnatural/generators/sparql/fromjsonv13/SparqlGeneratorV13';
import { JsonV13SparqlTranslator } from '../../sparnatural/generators/sparql/fromjsonv13/JsonV13SparqlTranslator';
import { SparnaturalQuery } from '../../sparnatural/SparnaturalQueryIfc-v13';
import { SparnaturalSpecificationFactory } from '../../sparnatural/spec-providers/SparnaturalSpecificationFactory';

const F = new AstFactory();

async function buildSpecProviderFromConfig(configTtl: string, language = 'en') {
  const factory = new SparnaturalSpecificationFactory();
  return await new Promise<any>((resolve, reject) => {
    try {
      factory.build(configTtl, language, undefined, (provider: any) => resolve(provider));
    } catch (e) {
      reject(e);
    }
  });
}

function buildSelectQuery(variables: string[], patterns: Pattern[]): QuerySelect {
  return F.querySelect({
    context: [],
    variables: variables.map((v) => SparqlFactoryV13.buildVariable(v)),
    where: SparqlFactoryV13.buildGroupPattern(patterns),
    solutionModifiers: {},
    datasets: F.datasetClauses([], F.gen()),
  }, F.gen());
}

/**
 * Builds the query :
 * SELECT ?Person_1 WHERE {
 *   ?Person_1 <http://example.com/knows> ?Person_2 .
 *   OPTIONAL { ?Person_2 <http://example.com/name> ?Name . }
 * }
 * and returns the query together with its 2 triples and 2 basic graph patterns, to attach comments on them
 */
function buildTestQuery() {
  const knows = SparqlFactoryV13.buildTriple(
    SparqlFactoryV13.buildVariable('Person_1'),
    SparqlFactoryV13.buildNamedNode('http://example.com/knows'),
    SparqlFactoryV13.buildVariable('Person_2'),
  );
  const name = SparqlFactoryV13.buildTriple(
    SparqlFactoryV13.buildVariable('Person_2'),
    SparqlFactoryV13.buildNamedNode('http://example.com/name'),
    SparqlFactoryV13.buildVariable('Name'),
  );
  const knowsBgp = SparqlFactoryV13.buildBgpPattern([knows]);
  const nameBgp = SparqlFactoryV13.buildBgpPattern([name]);
  const query = buildSelectQuery(['Person_1'], [
    knowsBgp,
    SparqlFactoryV13.buildOptionalPattern([nameBgp]),
  ]);
  return { query, knows, name, knowsBgp, nameBgp };
}

describe('SparqlGeneratorV13', () => {
  const generator = new SparqlGeneratorV13();
  const parser = new Parser();

  it('generates the same query as the standard Traqula generator when there are no comments', () => {
    const { query } = buildTestQuery();
    expect(generator.generate(query)).toBe(new Generator().generate(query));
    expect(generator.generate(query)).toBe(
      'SELECT ?Person_1 WHERE {\n' +
      '  ?Person_1 <http://example.com/knows> ?Person_2 .\n' +
      '  OPTIONAL {\n' +
      '    ?Person_2 <http://example.com/name> ?Name .\n' +
      '  }\n' +
      '}',
    );
  });

  it('prints the comments of triples and basic graph patterns on their own line, before them', () => {
    const { query, knows, name, knowsBgp } = buildTestQuery();
    addComment(knowsBgp, 'The persons known by Person_1');
    addComment(knows, 'Person knows Person');
    addComment(name, 'Name of the known person');

    expect(generator.generate(query)).toBe(
      'SELECT ?Person_1 WHERE {\n' +
      '  # The persons known by Person_1\n' +
      '  # Person knows Person\n' +
      '  ?Person_1 <http://example.com/knows> ?Person_2 .\n' +
      '  OPTIONAL {\n' +
      '    # Name of the known person\n' +
      '    ?Person_2 <http://example.com/name> ?Name .\n' +
      '  }\n' +
      '}',
    );
  });

  it('prints multiple comments, and comments spanning multiple lines, with a "#" on each line', () => {
    const { query, knows } = buildTestQuery();
    addComment(knows, 'first comment');
    addComment(knows, 'second comment\non two lines');

    expect(generator.generate(query)).toBe(
      'SELECT ?Person_1 WHERE {\n' +
      '  # first comment\n' +
      '  # second comment\n' +
      '  # on two lines\n' +
      '  ?Person_1 <http://example.com/knows> ?Person_2 .\n' +
      '  OPTIONAL {\n' +
      '    ?Person_2 <http://example.com/name> ?Name .\n' +
      '  }\n' +
      '}',
    );
  });

  it('ignores the other metadata attached to the nodes', () => {
    const { query: plainQuery } = buildTestQuery();
    const { query, knows, nameBgp } = buildTestQuery();
    withMetadata(knows).metadata.criteriaId = 'criteria-1';
    withMetadata(nameBgp).metadata.origin = { line: 2 };
    withMetadata(query).metadata.id = 'query-1';

    expect(generator.generate(query)).toBe(generator.generate(plainQuery));
  });

  it('keeps the metadata already attached to a node', () => {
    const { knows } = buildTestQuery();
    withMetadata(knows).metadata.criteriaId = 'criteria-1';
    addComment(knows, 'Person knows Person');

    expect(withMetadata(knows).metadata).toEqual({
      criteriaId: 'criteria-1',
      comments: ['Person knows Person'],
    });
  });

  it('generates a valid query, equivalent to the query without comments, when generating on a single line', () => {
    const { query: plainQuery } = buildTestQuery();
    const { query, knows, name } = buildTestQuery();
    addComment(knows, 'Person knows Person');
    addComment(name, 'Name of the known person');

    const singleLine = { [traqulaIndentation]: -1, indentInc: 0 };
    const generated = generator.generate(query, singleLine);

    // each comment must be closed by a line break, otherwise the rest of the query would be commented out
    expect(generated).toContain('# Person knows Person\n');
    expect(generated).toContain('# Name of the known person\n');
    expect(generator.generate(parser.parse(generated))).toBe(generator.generate(plainQuery));
  });

  it('can comment the SPARQL query translated from a Sparnatural query', async () => {
    const casedir = path.join(__dirname, 'cases', '01-simple-person-knows-person');
    const queryJson = JSON.parse(fs.readFileSync(path.join(casedir, 'query.json'), 'utf-8')) as SparnaturalQuery;
    const specProvider = await buildSpecProviderFromConfig(fs.readFileSync(path.join(casedir, 'config.ttl'), 'utf-8'));
    const settings = { language: 'en', addDistinct: true, limit: -1 } as any;

    const selectQuery = new JsonV13SparqlTranslator(specProvider, settings).generateQuery(queryJson);

    // comment every triple with the property it comes from in the configuration, if any
    // the same could be done while building the triples in the translator
    for (const pattern of selectQuery.where.patterns) {
      if (pattern.subType !== 'bgp') continue;
      for (const triple of pattern.triples) {
        if (F.isTripleCollection(triple) || !F.isTerm(triple.predicate) || !F.isTermNamed(triple.predicate)) continue;
        const property = specProvider.getProperty(triple.predicate.value);
        if (property) {
          addComment(triple, `criteria on property ${property.getLabel()}`);
        }
      }
    }

    const generated = generator.generate(selectQuery);
    expect(generated).toBe(
      'SELECT ?x ?o WHERE {\n' +
      '  ?x <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.com/Person> .\n' +
      '  # criteria on property knows\n' +
      '  ?x <http://example.com/Person_knows> ?o .\n' +
      '  ?o <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.com/Person> .\n' +
      '}',
    );
    // the comments do not change the query itself
    expect(generator.generate(parser.parse(generated))).toBe(
      generator.generate(new JsonV13SparqlTranslator(specProvider, settings).generateQuery(queryJson)),
    );
  });
});
