import { GeneratorBuilder, traqulaIndentation } from "@traqula/core";
import { sparql11GeneratorBuilder } from "@traqula/generator-sparql-1-1";
import {
  completeGeneratorContext,
  gram,
  PatternBgp,
  SparqlGeneratorContext,
  SparqlGeneratorRule,
  SparqlQuery,
  Sparql11Nodes,
} from "@traqula/rules-sparql-1-1";

/**
 * Additional information that can be attached to any node of the Traqula AST.
 * The generator ignores it, except for the "comments" key.
 */
export type SparqlNodeMetadata = Record<string, unknown> & {
  // comments printed on their own line(s) just before the node.
  // Currently supported on basic graph patterns and on the triples they contain
  comments?: string[];
};

/**
 * Makes sure the node has a metadata object, and returns the node itself
 * @param node Any node of the Traqula AST
 * @returns the same node, typed with its metadata
 */
export function withMetadata<T extends Sparql11Nodes>(node: T): T & { metadata: SparqlNodeMetadata } {
  const nodeWithMetadata = <T & { metadata?: SparqlNodeMetadata }> node;
  nodeWithMetadata.metadata ??= {};
  return <T & { metadata: SparqlNodeMetadata }> nodeWithMetadata;
}

/**
 * Attaches a comment to a node of the Traqula AST, which the SparqlGeneratorV13 prints as a "# ..." line before the node
 * @param node The node to comment. Currently comments are only printed on basic graph patterns and triples
 * @param comment The comment text, it may contain multiple lines
 * @returns the same node
 */
export function addComment<T extends Sparql11Nodes>(node: T, comment: string): T {
  const metadata = withMetadata(node).metadata;
  metadata.comments ??= [];
  metadata.comments.push(comment);
  return node;
}

/**
 * @returns the comments attached to the node through its metadata, if any
 */
function getComments(node: object): string[] {
  return (<{ metadata?: SparqlNodeMetadata }> node).metadata?.comments ?? [];
}

/**
 * Same as the triplesBlock rule of Traqula, but printing the comments attached to the basic graph pattern
 * and to each of its triples
 * See https://github.com/comunica/traqula/blob/main/packages/rules-sparql-1-1/lib/grammar/tripleBlock.ts
 */
const triplesBlockWithComments: SparqlGeneratorRule<"triplesBlock", PatternBgp> = {
  name: "triplesBlock",
  gImpl: ({ SUBRULE, PRINT, PRINT_WORD, PRINT_ON_OWN_LINE, HANDLE_LOC, NEW_LINE }) => (ast, C) => {
    const F = C.astFactory;

    const printComments = (node: object) => {
      getComments(node)
        // a comment spans until the end of the line, so each line of the comment needs its own "#"
        .flatMap((comment) => comment.split(/\r?\n/))
        .forEach((line) => {
          if (C[traqulaIndentation] < 0) {
            // generating on a single line : force the line break, otherwise the rest of the query would be commented
            PRINT_WORD("");
            PRINT(`# ${line}`, "\n");
          } else {
            PRINT_ON_OWN_LINE(`# ${line}`);
          }
        });
    };

    printComments(ast);

    for (const [ index, triple ] of ast.triples.entries()) {
      HANDLE_LOC(triple, () => {
        printComments(triple);

        const nextTriple = ast.triples[index + 1];
        if (F.isTripleCollection(triple)) {
          SUBRULE(gram.graphNodePath, triple);
          // A top level tripleCollection block means that it is not used as the subject of another triple
          F.printFilter(triple, () => {
            PRINT_WORD(".");
            NEW_LINE();
          });
        } else {
          // Subject
          SUBRULE(gram.graphNodePath, triple.subject);
          F.printFilter(triple, () => PRINT_WORD(""));
          // Predicate
          if (F.isTerm(triple.predicate) && F.isTermVariable(triple.predicate)) {
            SUBRULE(gram.varOrTerm, triple.predicate);
          } else {
            SUBRULE(gram.pathGenerator, triple.predicate, undefined);
          }
          F.printFilter(triple, () => PRINT_WORD(""));
          // Object
          SUBRULE(gram.graphNodePath, triple.object);

          // If no more things, or a top level collection (only possible if new block was part), or new subject: add DOT
          if (nextTriple === undefined || F.isTripleCollection(nextTriple) ||
            !F.isSourceLocationNoMaterialize(nextTriple.subject.loc)) {
            F.printFilter(ast, () => {
              PRINT_WORD(".");
              NEW_LINE();
            });
          } else if (F.isSourceLocationNoMaterialize(nextTriple.predicate.loc)) {
            F.printFilter(ast, () => PRINT_WORD(","));
          } else {
            F.printFilter(ast, () => {
              PRINT_WORD(";");
              NEW_LINE();
            });
          }
        }
      });
    }
  },
};

/**
 * The SPARQL 1.1 generator of Traqula, with the triplesBlock rule replaced to support comments
 */
const sparqlGeneratorV13Builder = GeneratorBuilder
  .create(sparql11GeneratorBuilder)
  .patchRule(triplesBlockWithComments);

/**
 * Generates the SPARQL string of a Traqula AST, including the comments attached to its nodes (see addComment)
 */
export class SparqlGeneratorV13 {
  #generator = sparqlGeneratorV13Builder.build();
  #defaultContext: SparqlGeneratorContext & { origSource: string };

  constructor(defaultContext: Partial<SparqlGeneratorContext> = {}) {
    this.#defaultContext = completeGeneratorContext(defaultContext);
  }

  generate(query: SparqlQuery, context: Partial<SparqlGeneratorContext> = {}): string {
    return this.#generator.queryOrUpdate(query, { ...this.#defaultContext, ...context }).trim();
  }
}
