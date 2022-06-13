import {FilterPattern, Generator, OptionalPattern, Ordering, Pattern, SelectQuery, Term, Triple, ValuePatternRow, ValuesPattern, Variable, VariableTerm } from "sparqljs";
import { Branch, CriteriaLine, ISparJson, Order } from "./ISparJson";
import { DataFactory } from "n3";
import { RDF } from "../spec-providers/RDFSpecificationProvider";
import ISpecProvider from "../spec-providers/ISpecProviders";
/**
 * Writes a Query data structure in SPARQL
 **/
export class QuerySPARQLWriter {
  typePredicate: string;
  specProvider: ISpecProvider;
  additionnalPrefixes:{[key:string]: string} = {};
  constructor(
    typePredicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    specProvider: any
  ) {
    this.typePredicate = typePredicate;
    this.specProvider = specProvider;
    this.additionnalPrefixes = {};
  }

  // add a new prefix to the generated query
  addPrefix(prefix: string | number, uri: any) {
    this.additionnalPrefixes[prefix] = uri;
  }

  setPrefixes(prefixes: any) {
    this.additionnalPrefixes = prefixes;
  }

  toSPARQL(q: ISparJson) {
    // deep clone the query, because we will modify it prior to execution
    var query:ISparJson = JSON.parse(JSON.stringify(q));
    // preprocess the query, in particular add extra criterias for labels
    this._preProcessQueryForLabelProperty(query);

    // add additionnal prefixes

    let RdfJsQuery:SelectQuery ={
      queryType: "SELECT",
      distinct:query.distinct,
      variables: this.#varsToRDFJS(query.variables),
      type: "query",
      where: this.#processBranches(query.branches),
      prefixes: {        
        rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        rdfs: "http://www.w3.org/2000/01/rdf-schema#",
        xsd: "http://www.w3.org/2001/XMLSchema#"
      },
      order:this.#orderToRDFJS(query.order,this.#varsToRDFJS(query.variables)[0])
    }
    for (var key in this.additionnalPrefixes) {
      RdfJsQuery.prefixes[key] = this.additionnalPrefixes[key]
    }
    console.log(RdfJsQuery)

    var generator = new Generator();
    var generatedQuery = generator.stringify(sparqlQuery);

    return generatedQuery;
  }

  #processBranches(branches:Array<Branch>): Pattern[]{
    let where:Pattern[] = branches.map(b=>{
      let filterExpr = b.notExists ? this.#buildFilterPattern() : null
      let optionalExpr = b.optional ? this.#buildOptionalPattern() : null
      let trippleExpr = this.#buildTripples(b.line)
      if(b.children.length > 0) return this.#processBranches(b.children)
    })
    return where
  }

  #buildTripples(l: CriteriaLine): Triple[]{
    let triples:Triple[] = []
    let startClass = this.#buildTripple(l.s,RDF.TYPE,l.sType)
    let endClass = this.#buildTripple(l.o,RDF.TYPE,l.oType)
    let connectingTripple = this.#buildTripple(l.s,l.pType,l.o)
    if(l.values.length > 0) this.#buildValueTriple(endClass.subject as Variable,l.values)
    return triples
  }

  #buildTripple(subj:string,pred:string,obj:string):Triple{
    return {
      subject: DataFactory.variable(subj),
      predicate: DataFactory.namedNode(pred),
      object: DataFactory.namedNode(obj)
    }
  }

  #buildFilterPattern(): FilterPattern{
    return {
      type: "filter",
      expression: undefined
    }
  }

  #buildOptionalPattern(): OptionalPattern{
    return {
      type: "optional",
      patterns: []
    }
  }

  // depending on the 
  #buildValuePattern(variable:Variable,values:IWidget['value'][]): Pattern[]{
    
  }

  #varsToRDFJS(variables:Array<string>): VariableTerm[]{
    return variables.map(v=>{
      return DataFactory.variable(v.replace('?',''))
    })
    /* OLD style
    return variables.map(v=>{
      let variable:VariableTerm = {
        termType: "Variable",
        value: v.replace('?', ''),
        equals: function (other: Term): boolean {
          return other === this.value
        }
      }
      return variable
    })*/
  }

  // It will be ordered by the Provided variable
  #orderToRDFJS(order:Order,variable:VariableTerm): Ordering[]{
    return [{
      expression:variable,
      descending: order == Order.DESC ? true : false
    }]
  }



  _preProcessQueryForLabelProperty(jsonQuery: ISparJson) {
    jsonQuery.branches = jsonQuery.branches.map((b,i)=>{
      return this._preprocessBranchForLabelProperty_rec(
        b,
        i == 0,
        jsonQuery
      );
    })
  }

  _preprocessBranchForLabelProperty_rec(
    branch: Branch,
    firstTopLevelBranch: boolean,
    jsonQuery:ISparJson
  ) {
    branch.children = branch.children.map(c=>{
     return this._preprocessBranchForLabelProperty_rec(
      c,
      false,
      jsonQuery
    );
    })

    if (
      jsonQuery.variables.includes(branch.line.s) &&
      this.specProvider.getDefaultLabelProperty(branch.line.sType) != null &&
      firstTopLevelBranch
    ) {
      var labelProperty = this.specProvider.getDefaultLabelProperty(
        branch.line.sType
      );

      if (branch.parent == null) {
        // add criteria to fetch the label
        var newBranch = new QueryBranch();
        newBranch.line = new QueryLine(
          branch.line.s,
          branch.line.sType,
          labelProperty,
          this.specProvider.readRange(labelProperty)[0],
          branch.line.s + "_label"
        );
        // set it optional if declared
        newBranch.optional =
          this.specProvider.isEnablingOptional(labelProperty);
        jsonQuery.branches.push(newBranch);
        // and select the new variable, right after the original one
        jsonQuery.variables.splice(
          jsonQuery.variables.indexOf(branch.line.s) + 1,
          0,
          branch.line.s + "_label"
        );
      }
    }

    if (
      jsonQuery.variables.includes(branch.line.o) &&
      this.specProvider.getDefaultLabelProperty(branch.line.oType) != null
    ) {
      var labelProperty = this.specProvider.getDefaultLabelProperty(
        branch.line.oType
      );

      // add criteria to fetch the label
      var newBranch = new QueryBranch();
      newBranch.line = new QueryLine(
        branch.line.o,
        branch.line.oType,
        labelProperty,
        this.specProvider.readRange(labelProperty)[0],
        branch.line.o + "_label"
      );
      // set it optional if declared
      newBranch.optional = this.specProvider.isEnablingOptional(labelProperty);
      branch.children.push(newBranch);
      // and select the new variable, right after the original one
      jsonQuery.variables.splice(
        jsonQuery.variables.indexOf(branch.line.o) + 1,
        0,
        branch.line.o + "_label"
      );
    }

    return branch;
  }

  _QueryBranchToSPARQL(
    sparqlQuery: any,
    parent: any[],
    queryBranch:Branch,
    firstTopLevelBranch: boolean,
    query: any
  ) {
    // write the line
    var parentInSparqlQuery = parent;
    if (queryBranch.optional) {
      var optional = this._initOptional();
      parent.push(optional);
      parentInSparqlQuery = optional.patterns;
    } else if (queryBranch.notExists) {
      var filterNotExists = this._initFilterNotExists();
      parent.push(filterNotExists);
      parentInSparqlQuery = filterNotExists.expression.args[0].patterns;
    }
    this._QueryLineToSPARQL(
      parentInSparqlQuery,
      sparqlQuery,
      queryBranch.line,
      firstTopLevelBranch,
      query
    );

    // iterate on children
    for (var i = 0; i < queryBranch.children.length; i++) {
      // recursive call on children
      this._QueryBranchToSPARQL(
        sparqlQuery,
        parentInSparqlQuery,
        queryBranch.children[i],
        false,
        query
      );
    }
  }

  _QueryLineToSPARQL(
    parentInSparqlQuery: { type: string; triples?: any[]; patterns?: any[]; expression?: any; values?: any[]; }[],
    completeSparqlQuery: { where: { type: string; triples: any[]; }[]; },
    queryLine: { s: string; sType: any; p: any; o: string | number; values: any[]; oType: any; },
    includeSubjectType = false,
    query: { defaultLang: any; variables: string | any[]; }
  ) {
    var bgp = this._initBasicGraphPattern();

    // only for the very first criteria
    if (includeSubjectType) {
      var typeBgp = this._initBasicGraphPattern();
      typeBgp.triples.push(
        this._buildTriple(queryLine.s, this.typePredicate, queryLine.sType)
      );
      // this criteria is _always_ inserted in the global where,
      // ant not in the parent OPTIONAL or FILTER NOT EXISTS
      completeSparqlQuery.where.push(typeBgp);
    }

    // insert BGP righ now so that lang filter comes after in generated SPARQL
    parentInSparqlQuery.push(bgp);

    if (queryLine.p && queryLine.o) {
      var beginDateProp = this.specProvider.getBeginDateProperty(queryLine.p);
      var endDateProp = this.specProvider.getEndDateProperty(queryLine.p);
      if (beginDateProp !== null && endDateProp !== null) {
        // if we are on a date criteria
        if (
          queryLine.values.length == 1 &&
          (queryLine.values[0].start || queryLine.values[0].stop)
        ) {
          var exactDateProp = this.specProvider.getExactDateProperty(
            queryLine.p
          );
          var bitsOfQuery = this._initDateRangeOrExactDateCriteria(
            // beginDateProp,
            beginDateProp,
            // endDateProp,
            endDateProp,
            // exactDateProp,
            exactDateProp,
            // subjectVariable,
            queryLine.s,
            // objectVariable,
            queryLine.o,
            // startDate,
            queryLine.values[0].start,
            // endDate
            queryLine.values[0].end
          );
          bitsOfQuery.forEach((element) => parentInSparqlQuery.push(element));
        }
      } else {
        if (queryLine.values.length == 0) {
          // no value, insert ?s ?p ?o line
          bgp.triples.push(
            this._buildTriple(queryLine.s, queryLine.p, queryLine.o)
          );

          // if the property can be multilingual, insert a FILTER(langMatches(lang(?x), "fr"))
          if (this.specProvider.isMultilingual(queryLine.p)) {
            parentInSparqlQuery.push(
              this._initFilterLang(query.defaultLang, queryLine.o)
            );
          }

          // if the class of the value does no correspond to a literal, insert a criteria
          // on its rdf:type, if it is not remote
          if (
            !this.specProvider.isLiteralClass(queryLine.oType) &&
            !this.specProvider.isRemoteClass(queryLine.oType)
          ) {
            bgp.triples.push(
              this._buildTriple(
                queryLine.o,
                this.typePredicate,
                queryLine.oType
              )
            );
          }
        } else if (
          // there is a single value
          queryLine.values.length == 1 &&
          // and it is a URI or a Literal
          (queryLine.values[0].uri || queryLine.values[0].literal) &&
          // and we don't need the value to be selected
          !query.variables.includes(queryLine.o)
        ) {
          // if we are in a value selection widget and we have a single value selected
          // then insert the value directly as the object of the triple
          bgp.triples.push(
            this._buildTriple(
              queryLine.s,
              queryLine.p,
              // either a URI or a literal in case of LiteralList widget
              queryLine.values[0].uri
                ? queryLine.values[0].uri
                : queryLine.values[0].literal,
              // insert as a literal if the value is a literal value
              queryLine.values[0] instanceof LiteralValue
            )
          );
        } else if (
          queryLine.values.length == 1 &&
          queryLine.values[0].boolean &&
          !query.variables.includes(queryLine.o)
        ) {
          // build direct boolean value
          bgp.triples.push(
            this._buildTriple(
              queryLine.s,
              queryLine.p,
              '"' +
                queryLine.values[0].boolean +
                '"^^http://www.w3.org/2001/XMLSchema#boolean',
              false
            )
          );
        } else {
          // more than one value for an URI, or a search criteria
          // push in the bgp only s/p/o, values are inserted after
          bgp.triples.push(
            this._buildTriple(queryLine.s, queryLine.p, queryLine.o)
          );

          // if the property can be multilingual, insert a FILTER(langMatches(lang(?x), "fr"))
          if (this.specProvider.isMultilingual(queryLine.p)) {
            parentInSparqlQuery.push(
              this._initFilterLang(query.defaultLang, queryLine.o)
            );
          }
        }

        // this can only be the case for value selection widgets
        if (
          // we use a VALUES if there is more than one value
          queryLine.values.length > 1 ||
          // or if there is only one, but we need the variable to be selected
          // only
          (queryLine.values.length == 1 &&
            (queryLine.values[0].uri || queryLine.values[0].literal) &&
            query.variables.includes(queryLine.o))
        ) {
          var jsonValues = this._initValues();
          queryLine.values.forEach(function (v: { uri: any; literal: string; }) {
            var newValue = {};
            // either a URI or a literal in case of LiteralList widget
            newValue[queryLine.o] = v.uri ? v.uri : '"' + v.literal + '"';
            jsonValues.values.push(newValue);
          });
          parentInSparqlQuery.push(jsonValues);
        }

        // if we have a date criteria
        if (
          queryLine.values.length == 1 &&
          (queryLine.values[0].start || queryLine.values[0].end)
        ) {
          parentInSparqlQuery.push(
            this._initFilterTime(
              queryLine.values[0].start,
              queryLine.values[0].end,
              queryLine.o
            )
          );
        }

        // if we have a regex criteria
        if (queryLine.values.length == 1 && queryLine.values[0].regex) {
          parentInSparqlQuery.push(
            this._initFilterRegex(queryLine.values[0].regex, queryLine.o)
          );

          // TODO : language filter
        }

        // if we have a lucene query criteria
        if (
          queryLine.values.length == 1 &&
          queryLine.values[0].luceneQueryValue
        ) {
          this._updateGraphDbPrefixes(completeSparqlQuery);
          // name of index must correspond to the local name of the range class
          var connectorName = this._localName(queryLine.oType);
          // field name in index corresponds to the local name of the property
          var fieldName = this._localName(queryLine.p);
          var searchVariable = queryLine.s + "Search";

          var newBasicGraphPattern = this._initBasicGraphPattern();
          newBasicGraphPattern.triples.push(
            this._buildTriple(
              searchVariable,
              this.typePredicate,
              "http://www.ontotext.com/connectors/lucene/instance#" +
                connectorName
            )
          );
          // add literal triple
          newBasicGraphPattern.triples.push(
            this._buildTriple(
              searchVariable,
              "http://www.ontotext.com/connectors/lucene#query",
              fieldName + ":" + queryLine.values[0].luceneQueryValue,
              true
            )
          );
          newBasicGraphPattern.triples.push(
            this._buildTriple(
              searchVariable,
              "http://www.ontotext.com/connectors/lucene#entities",
              queryLine.s
            )
          );
          parentInSparqlQuery.push(newBasicGraphPattern);
        }

        // if we have an exact string criteria
        if (queryLine.values.length == 1 && queryLine.values[0].string) {
          parentInSparqlQuery.push(
            this._initFilterStringEquals(
              queryLine.values[0].string,
              queryLine.o
            )
          );

          // TODO : language filter
        }
      } // end case of begin date / start date
    } // end if p & o
  }

  _buildTriple(subjet: string, predicate: string, object: string, literalObject = false) {
    // encapsulates the object in quotes so that it is interpreted as a literal
    var objectValue = literalObject ? '"' + object + '"' : object;
    var triple = {
      subject: subjet,
      predicate: predicate,
      object: objectValue,
    };

    return triple;
  }

  _initBasicGraphPattern() {
    return {
      type: "bgp",
      triples: [],
    };
  }

  _initGroup() {
    return {
      type: "group",
      patterns: [],
    };
  }

  _initUnion() {
    return {
      type: "union",
      patterns: [],
    };
  }

  _initValues() {
    return {
      type: "values",
      values: [],
    };
  }

  _initOptional() {
    return {
      type: "optional",
      patterns: [],
    };
  }

  _initFilterNotExists() {
    return {
      type: "filter",
      expression: {
        type: "operation",
        operator: "notexists",
        args: [
          {
            type: "group",
            patterns: [],
          },
        ],
      },
    };
  }

  _initFilterTime(startTime: string, endTime: string, variable: string) {
    var filters = new Array();
    if (startTime != null) {
      filters.push({
        type: "operation",
        operator: ">=",
        args: [
          {
            type: "functioncall",
            function: "http://www.w3.org/2001/XMLSchema#dateTime",
            args: ["" + variable + ""],
          },
          '"' + startTime + '"^^http://www.w3.org/2001/XMLSchema#dateTime',
        ],
      });
    }
    if (endTime != null) {
      filters.push({
        type: "operation",
        operator: "<=",
        args: [
          {
            type: "functioncall",
            function: "http://www.w3.org/2001/XMLSchema#dateTime",
            args: ["" + variable + ""],
          },
          '"' + endTime + '"^^http://www.w3.org/2001/XMLSchema#dateTime',
        ],
      });
    }

    if (filters.length == 2) {
      return {
        type: "filter",
        expression: {
          type: "operation",
          operator: "&&",
          args: filters,
        },
      };
    } else {
      return {
        type: "filter",
        expression: filters[0],
      };
    }
  }

  _initFilterRegex(texte: string, variable: string) {
    return {
      type: "filter",
      expression: {
        type: "operation",
        operator: "regex",
        args: ["" + variable + "", '"' + texte + '"', '"i"'],
      },
    };
  }

  _initFilterLang(lang: string, variable: string) {
    return {
      type: "filter",
      expression: {
        type: "operation",
        operator: "langMatches",
        args: [
          {
            type: "operation",
            operator: "lang",
            args: ["" + variable + ""],
          },
          '"' + lang + '"',
        ],
      },
    };
  }

  _initFilterStringEquals(texte: string, variable: string) {
    return {
      type: "filter",
      expression: {
        type: "operation",
        operator: "=",
        args: [
          {
            type: "operation",
            operator: "lcase",
            args: ["" + variable + ""],
          },
          {
            type: "operation",
            operator: "lcase",
            args: ['"' + texte + '"'],
          },
        ],
      },
    };
  }

  _initDateRangeOrExactDateCriteria(
    beginDateProp: any,
    endDateProp: any,
    exactDateProp: any,
    subjectVariable: any,
    objectVariable: string,
    startDate: any,
    endDate: any
  ) {
    if (exactDateProp != null) {
      var result = this._initUnion();

      // first alternative of the union to test exact date
      var firstAlternative = this._initGroup();
      var bgp = this._initBasicGraphPattern();
      var exactDateVarName = objectVariable + "_exact";
      bgp.triples.push(
        this._buildTriple(subjectVariable, exactDateProp, exactDateVarName)
      );
      firstAlternative.patterns.push(bgp);
      // exact date is within provided date range
      firstAlternative.patterns.push(
        this._initFilterTime(startDate, endDate, exactDateVarName)
      );

      // second alternative to test date range
      var secondAlternative = this._initGroup();
      secondAlternative.patterns.push(
        this._initDateRangeCriteria(
          beginDateProp,
          endDateProp,
          subjectVariable,
          objectVariable,
          startDate,
          endDate
        )
      );

      result.patterns.push(firstAlternative);
      result.patterns.push(secondAlternative);
      // return as an array so that caller can have generic forEach loop to all
      // every element to outer query
      return [result];
    } else {
      return this._initDateRangeCriteria(
        beginDateProp,
        endDateProp,
        subjectVariable,
        objectVariable,
        startDate,
        endDate
      );
    }
  }

  // builds a date range criteria to test the overlap between a date range of the resource
  // and the provided date range.
  // The provided date range may have only start date or end date provided
  _initDateRangeCriteria(
    beginDateProp: any,
    endDateProp: any,
    subjectVariable: any,
    objectVariable: string,
    startDate: any,
    endDate: any
  ) {
    var result = this._initUnion();

    // we have provided both begin and end date criteria
    if (startDate != null && endDate != null) {
      // 1. case where the resource has both start date and end date
      var firstAlternative = this._initGroup();
      var bgp = this._initBasicGraphPattern();
      var beginDateVarName = objectVariable + "_begin";
      var endDateVarName = objectVariable + "_end";

      bgp.triples.push(
        this._buildTriple(subjectVariable, beginDateProp, beginDateVarName)
      );
      bgp.triples.push(
        this._buildTriple(subjectVariable, endDateProp, endDateVarName)
      );
      firstAlternative.patterns.push(bgp);

      // begin date is before given end date
      firstAlternative.patterns.push(
        this._initFilterTime(null, endDate, beginDateVarName)
      );
      // end date is after given start date
      firstAlternative.patterns.push(
        this._initFilterTime(startDate, null, endDateVarName)
      );

      // 2. case where the resource has only a start date
      var secondAlternative = this._initGroup();
      var secondBgp = this._initBasicGraphPattern();
      secondBgp.triples.push(
        this._buildTriple(subjectVariable, beginDateProp, beginDateVarName)
      );
      secondAlternative.patterns.push(secondBgp);
      var notExistsEndDate = this._initFilterNotExists();
      notExistsEndDate.expression.args[0].patterns.push(
        this._buildTriple(subjectVariable, endDateProp, endDateVarName)
      );
      secondAlternative.patterns.push(notExistsEndDate);
      // begin date is before given end date
      secondAlternative.patterns.push(
        this._initFilterTime(null, endDate, beginDateVarName)
      );

      // 3. case where the resource has only a end date
      var thirdAlternative = this._initGroup();
      var thirdBgp = this._initBasicGraphPattern();
      thirdBgp.triples.push(
        this._buildTriple(subjectVariable, endDateProp, endDateVarName)
      );
      thirdAlternative.patterns.push(thirdBgp);
      var notExistsBeginDate = this._initFilterNotExists();
      notExistsBeginDate.expression.args[0].patterns.push(
        this._buildTriple(subjectVariable, beginDateProp, beginDateVarName)
      );
      thirdAlternative.patterns.push(notExistsBeginDate);
      // end date is after given start date
      thirdAlternative.patterns.push(
        this._initFilterTime(startDate, null, endDateVarName)
      );

      result.patterns.push(firstAlternative);
      result.patterns.push(secondAlternative);
      result.patterns.push(thirdAlternative);

      // we have provided only a start date
    } else if (startDate != null && endDate === null) {
      var bgp = this._initBasicGraphPattern();
      var endDateVarName = objectVariable + "_end";
      bgp.triples.push(
        this._buildTriple(subjectVariable, endDateProp, endDateVarName)
      );
      result.push(bgp);
      // end date is after given start date
      result.push(this._initFilterTime(startDate, null, endDateVarName));

      // if the resource has no end date, and has only a start date
      // then it necessarily overlaps with the provided open-ended range
      // so let's avoid this case for the moment
      // we have provided only a end date
    } else if (startDate === null && endDate != null) {
      var bgp = this._initBasicGraphPattern();
      var beginDateVarName = objectVariable + "_begin";
      bgp.triples.push(
        this._buildTriple(subjectVariable, beginDateProp, beginDateVarName)
      );
      result.push(bgp);
      // begin date is before given end date
      result.push(this._initFilterTime(null, endDate, beginDateVarName));
    }

    // return as an array so that caller can have generic forEach loop to all
    // every element to outer query
    return [result];
  }

  _updateGraphDbPrefixes(jsonQuery: { prefixes: { inst: string; lucene: string; }; }) {
    jsonQuery.prefixes.inst =
      "http://www.ontotext.com/connectors/lucene/instance#";
    jsonQuery.prefixes.lucene = "http://www.ontotext.com/connectors/lucene#";
    return jsonQuery;
  }

  _localName(uri: string) {
    if (uri.indexOf("#") > -1) {
      return uri.split("#")[1];
    } else {
      var components = uri.split("/");
      return components[components.length - 1];
    }
  }
}
