(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.sparqljs = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
var XSD_INTEGER = 'http://www.w3.org/2001/XMLSchema#integer';

function Generator(options, prefixes) {
  this._options = options || {};

  prefixes = prefixes || {};
  this._prefixByIri = {};
  var prefixIris = [];
  for (var prefix in prefixes) {
    var iri = prefixes[prefix];
    if (typeof iri === 'string') {
      this._prefixByIri[iri] = prefix;
      prefixIris.push(iri);
    }
  }
  var iriList = prefixIris.join('|').replace(/[\]\/\(\)\*\+\?\.\\\$]/g, '\\$&');
  this._prefixRegex = new RegExp('^(' + iriList + ')([a-zA-Z][\\-_a-zA-Z0-9]*)$');
  this._usedPrefixes = {};
}

var INDENTATION = '  ';

// Converts the parsed query object into a SPARQL query
Generator.prototype.toQuery = function (q) {
  var query = '';

  if (q.queryType)
    query += q.queryType.toUpperCase() + ' ';
  if (q.reduced)
    query += 'REDUCED ';
  if (q.distinct)
    query += 'DISTINCT ';

  if (q.variables)
    query += mapJoin(q.variables, undefined, function (variable) {
      return isString(variable) ? this.toEntity(variable) :
             '(' + this.toExpression(variable.expression) + ' AS ' + variable.variable + ')';
    }, this) + ' ';
  else if (q.template)
    query += this.group(q.template, true) + '\n';

  if (q.from)
    query += mapJoin(q.from.default || [], '', function (g) { return 'FROM ' + this.toEntity(g) + '\n'; }, this) +
             mapJoin(q.from.named || [], '', function (g) { return 'FROM NAMED ' + this.toEntity(g) + '\n'; }, this);
  if (q.where)
    query += 'WHERE ' + this.group(q.where, true)  + '\n';

  if (q.updates)
    query += mapJoin(q.updates, ';\n', this.toUpdate, this);

  if (q.group)
    query += 'GROUP BY ' + mapJoin(q.group, undefined, function (it) {
      var result = isString(it.expression) ? it.expression : '(' + this.toExpression(it.expression) + ')';
      return it.variable ? '(' + result + ' AS ' + it.variable + ')' : result;
    }, this) + '\n';
  if (q.having)
    query += 'HAVING (' + mapJoin(q.having, undefined, this.toExpression, this) + ')\n';
  if (q.order)
    query += 'ORDER BY ' + mapJoin(q.order, undefined, function (it) {
      var expr = '(' + this.toExpression(it.expression) + ')';
      return !it.descending ? expr : 'DESC ' + expr;
    }, this) + '\n';

  if (q.offset)
    query += 'OFFSET ' + q.offset + '\n';
  if (q.limit)
    query += 'LIMIT ' + q.limit + '\n';

  if (q.values)
    query += this.values(q);

  // stringify prefixes at the end to mark used ones
  query = this.baseAndPrefixes(q) + query;
  return query.trim();
};

Generator.prototype.baseAndPrefixes = function (q) {
  var base = q.base ? ('BASE <' + q.base + '>\n') : '';
  var prefixes = '';
  for (var key in q.prefixes) {
    if (this._options.allPrefixes || this._usedPrefixes[key])
      prefixes += 'PREFIX ' + key + ': <' + q.prefixes[key] + '>\n';
  }
  return base + prefixes;
};

// Converts the parsed SPARQL pattern into a SPARQL pattern
Generator.prototype.toPattern = function (pattern) {
  var type = pattern.type || (pattern instanceof Array) && 'array' ||
             (pattern.subject && pattern.predicate && pattern.object ? 'triple' : '');
  if (!(type in this))
    throw new Error('Unknown entry type: ' + type);
  return this[type](pattern);
};

Generator.prototype.triple = function (t) {
  return this.toEntity(t.subject) + ' ' + this.toEntity(t.predicate) + ' ' + this.toEntity(t.object) + '.';
};

Generator.prototype.array = function (items) {
  return mapJoin(items, '\n', this.toPattern, this);
};

Generator.prototype.bgp = function (bgp) {
  return this.encodeTriples(bgp.triples);
};

Generator.prototype.encodeTriples = function (triples) {
  if (!triples.length)
    return '';

  var parts = [], subject = '', predicate = '';
  for (var i = 0; i < triples.length; i++) {
    var triple = triples[i];
    // Triple with different subject
    if (triple.subject !== subject) {
      // Terminate previous triple
      if (subject)
        parts.push('.\n');
      subject = triple.subject;
      predicate = triple.predicate;
      parts.push(this.toEntity(subject), ' ', this.toEntity(predicate));
    }
    // Triple with same subject but different predicate
    else if (triple.predicate !== predicate) {
      predicate = triple.predicate;
      parts.push(';\n', INDENTATION, this.toEntity(predicate));
    }
    // Triple with same subject and predicate
    else {
      parts.push(',');
    }
    parts.push(' ', this.toEntity(triple.object));
  }
  parts.push('.');

  return parts.join('');
}

Generator.prototype.graph = function (graph) {
  return 'GRAPH ' + this.toEntity(graph.name) + ' ' + this.group(graph);
};

Generator.prototype.group = function (group, inline) {
  group = inline !== true ? this.array(group.patterns || group.triples)
                          : this.toPattern(group.type !== 'group' ? group : group.patterns);
  return group.indexOf('\n') === -1 ? '{ ' + group + ' }' : '{\n' + indent(group) + '\n}';
};

Generator.prototype.query = function (query) {
  return this.toQuery(query);
};

Generator.prototype.filter = function (filter) {
  return 'FILTER(' + this.toExpression(filter.expression) + ')';
};

Generator.prototype.bind = function (bind) {
  return 'BIND(' + this.toExpression(bind.expression) + ' AS ' + bind.variable + ')';
};

Generator.prototype.optional = function (optional) {
  return 'OPTIONAL ' + this.group(optional);
};

Generator.prototype.union = function (union) {
  return mapJoin(union.patterns, '\nUNION\n', function (p) { return this.group(p, true); }, this);
};

Generator.prototype.minus = function (minus) {
  return 'MINUS ' + this.group(minus);
};

Generator.prototype.values = function (valuesList) {
  // Gather unique keys
  var keys = Object.keys(valuesList.values.reduce(function (keyHash, values) {
    for (var key in values) keyHash[key] = true;
    return keyHash;
  }, {}));
  // Create value rows
  return 'VALUES (' + keys.join(' ') + ') {\n' +
    mapJoin(valuesList.values, '\n', function (values) {
      return '  (' + mapJoin(keys, undefined, function (key) {
        return values[key] !== undefined ? this.toEntity(values[key]) : 'UNDEF';
      }, this) + ')';
    }, this) + '\n}';
};

Generator.prototype.service = function (service) {
  return 'SERVICE ' + (service.silent ? 'SILENT ' : '') + this.toEntity(service.name) + ' ' +
         this.group(service);
};

// Converts the parsed expression object into a SPARQL expression
Generator.prototype.toExpression = function (expr) {
  if (isString(expr))
    return this.toEntity(expr);

  switch (expr.type.toLowerCase()) {
    case 'aggregate':
      return expr.aggregation.toUpperCase() +
             '(' + (expr.distinct ? 'DISTINCT ' : '') + this.toExpression(expr.expression) +
             (expr.separator ? '; SEPARATOR = ' + this.toEntity('"' + expr.separator + '"') : '') + ')';
    case 'functioncall':
      return this.toEntity(expr.function) + '(' + mapJoin(expr.args, ', ', this.toExpression, this) + ')';
    case 'operation':
      var operator = expr.operator.toUpperCase(), args = expr.args || [];
      switch (expr.operator.toLowerCase()) {
      // Infix operators
      case '<':
      case '>':
      case '>=':
      case '<=':
      case '&&':
      case '||':
      case '=':
      case '!=':
      case '+':
      case '-':
      case '*':
      case '/':
          return (isString(args[0]) ? this.toEntity(args[0]) : '(' + this.toExpression(args[0]) + ')') +
                 ' ' + operator + ' ' +
                 (isString(args[1]) ? this.toEntity(args[1]) : '(' + this.toExpression(args[1]) + ')');
      // Unary operators
      case '!':
        return '!' + this.toExpression(args[0]);
      // IN and NOT IN
      case 'notin':
        operator = 'NOT IN';
      case 'in':
        return this.toExpression(args[0]) + ' ' + operator +
               '(' + (isString(args[1]) ? args[1] : mapJoin(args[1], ', ', this.toExpression, this)) + ')';
      // EXISTS and NOT EXISTS
      case 'notexists':
        operator = 'NOT EXISTS';
      case 'exists':
        return operator + ' ' + this.group(args[0], true);
      // Other expressions
      default:
        return operator + '(' + mapJoin(args, ', ', this.toExpression, this) + ')';
      }
    default:
      throw new Error('Unknown expression type: ' + expr.type);
  }
};

// Converts the parsed entity (or property path) into a SPARQL entity
Generator.prototype.toEntity = function (value) {
  // regular entity
  if (isString(value)) {
    switch (value[0]) {
    // variable, * selector, or blank node
    case '?':
    case '$':
    case '*':
    case '_':
      return value;
    // literal
    case '"':
      var match = value.match(/^"([^]*)"(?:(@.+)|\^\^(.+))?$/) || {},
          lexical = match[1] || '', language = match[2] || '', datatype = match[3];
      value = '"' + lexical.replace(escape, escapeReplacer) + '"' + language;
      if (datatype) {
        if (datatype === XSD_INTEGER && /^\d+$/.test(lexical))
          // Add space to avoid confusion with decimals in broken parsers
          return lexical + ' ';
        value += '^^' + this.encodeIRI(datatype);
      }
      return value;
    // IRI
    default:
      return this.encodeIRI(value);
    }
  }
  // property path
  else {
    var items = value.items.map(this.toEntity, this), path = value.pathType;
    switch (path) {
    // prefix operator
    case '^':
    case '!':
      return path + items[0];
    // postfix operator
    case '*':
    case '+':
    case '?':
      return '(' + items[0] + path + ')';
    // infix operator
    default:
      return '(' + items.join(path) + ')';
    }
  }
};
var escape = /["\\\t\n\r\b\f]/g,
    escapeReplacer = function (c) { return escapeReplacements[c]; },
    escapeReplacements = { '\\': '\\\\', '"': '\\"', '\t': '\\t',
                           '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f' };

// Represent the IRI, as a prefixed name when possible
Generator.prototype.encodeIRI = function (iri) {
  var prefixMatch = this._prefixRegex.exec(iri);
  if (prefixMatch) {
    var prefix = this._prefixByIri[prefixMatch[1]];
    this._usedPrefixes[prefix] = true;
    return prefix + ':' + prefixMatch[2];
  }
  return '<' + iri + '>';
};

// Converts the parsed update object into a SPARQL update clause
Generator.prototype.toUpdate = function (update) {
  switch (update.type || update.updateType) {
  case 'load':
    return 'LOAD' + (update.source ? ' ' + this.toEntity(update.source) : '') +
           (update.destination ? ' INTO GRAPH ' + this.toEntity(update.destination) : '');
  case 'insert':
    return 'INSERT DATA '  + this.group(update.insert, true);
  case 'delete':
    return 'DELETE DATA '  + this.group(update.delete, true);
  case 'deletewhere':
    return 'DELETE WHERE ' + this.group(update.delete, true);
  case 'insertdelete':
    return (update.graph ? 'WITH ' + this.toEntity(update.graph) + '\n' : '') +
           (update.delete.length ? 'DELETE ' + this.group(update.delete, true) + '\n' : '') +
           (update.insert.length ? 'INSERT ' + this.group(update.insert, true) + '\n' : '') +
           'WHERE ' + this.group(update.where, true);
  case 'add':
  case 'copy':
  case 'move':
    return update.type.toUpperCase() + (update.source.default ? ' DEFAULT ' : ' ') +
           'TO ' + this.toEntity(update.destination.name);
  case 'clear':
  case 'drop':
    return update.type.toUpperCase() + (update.silent ? ' SILENT ' : ' ') + (
      update.graph.default ? 'DEFAULT' :
      update.graph.named ? 'NAMED' :
      update.graph.all ? 'ALL' :
      ('GRAPH ' + this.toEntity(update.graph.name))
    );
  default:
    throw new Error('Unknown update query type: ' + update.type);
  }
};

// Checks whether the object is a string
function isString(object) { return typeof object === 'string'; }

// Maps the array with the given function, and joins the results using the separator
function mapJoin(array, sep, func, self) {
  return array.map(func, self).join(isString(sep) ? sep : ' ');
}

// Indents each line of the string
function indent(text) { return text.replace(/^/gm, INDENTATION); }

/**
 * @param options {
 *   allPrefixes: boolean
 * }
 */
module.exports = function SparqlGenerator(options) {
  return {
    stringify: function (q) { return new Generator(options, q.prefixes).toQuery(q); }
  };
};

},{}],3:[function(require,module,exports){
(function (process){
/* parser generated by jison 0.4.18 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var SparqlParser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[6,12,15,24,34,43,48,97,107,110,112,113,122,123,128,297,298,299,300,301],$V1=[2,195],$V2=[97,107,110,112,113,122,123,128,297,298,299,300,301],$V3=[1,18],$V4=[1,27],$V5=[6,83],$V6=[38,39,51],$V7=[38,51],$V8=[1,55],$V9=[1,57],$Va=[1,53],$Vb=[1,56],$Vc=[28,29,292],$Vd=[13,16,285],$Ve=[109,131,295,302],$Vf=[13,16,109,131,285],$Vg=[1,79],$Vh=[1,83],$Vi=[1,85],$Vj=[109,131,295,296,302],$Vk=[13,16,109,131,285,296],$Vl=[1,91],$Vm=[2,235],$Vn=[1,90],$Vo=[13,16,28,29,80,165,214,217,218,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285],$Vp=[6,38,39,51,61,68,71,79,81,83],$Vq=[6,13,16,28,38,39,51,61,68,71,79,81,83,285],$Vr=[6,13,16,28,29,31,32,38,39,41,51,61,68,71,79,80,81,83,90,106,109,122,123,125,130,157,158,160,163,164,165,182,186,207,212,214,215,217,218,222,226,230,245,250,267,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,292,303,305,306,308,309,310,311,312,313,314,315],$Vs=[1,106],$Vt=[1,107],$Vu=[6,13,16,28,29,39,41,80,83,109,157,158,160,163,164,165,214,217,218,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,303],$Vv=[28,32],$Vw=[2,292],$Vx=[1,122],$Vy=[1,120],$Vz=[6,182],$VA=[2,309],$VB=[2,297],$VC=[38,125],$VD=[6,41,68,71,79,81,83],$VE=[2,237],$VF=[1,136],$VG=[1,138],$VH=[1,148],$VI=[1,154],$VJ=[1,157],$VK=[1,153],$VL=[1,155],$VM=[1,151],$VN=[1,152],$VO=[1,158],$VP=[1,159],$VQ=[1,162],$VR=[1,163],$VS=[1,164],$VT=[1,165],$VU=[1,166],$VV=[1,167],$VW=[1,168],$VX=[1,169],$VY=[1,170],$VZ=[1,171],$V_=[1,172],$V$=[1,173],$V01=[6,61,68,71,79,81,83],$V11=[28,29,38,39,51],$V21=[13,16,28,29,80,247,248,249,251,253,254,256,257,260,262,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,315,316,317,318,319,320],$V31=[2,406],$V41=[1,186],$V51=[1,187],$V61=[1,188],$V71=[13,16,41,80,90,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285],$V81=[6,106,182],$V91=[41,109],$Va1=[6,41,71,79,81,83],$Vb1=[2,321],$Vc1=[2,313],$Vd1=[1,222],$Ve1=[1,224],$Vf1=[41,109,303],$Vg1=[13,16,28,29,32,39,41,80,83,109,157,158,160,163,164,165,182,186,207,212,214,215,217,218,250,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,303],$Vh1=[13,16,28,29,31,32,39,41,80,83,90,109,157,158,160,163,164,165,182,186,207,212,214,215,217,218,222,226,230,245,250,267,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,292,303,306,309,310,311,312,313,314,315],$Vi1=[13,16,28,29,31,32,39,41,80,83,90,109,157,158,160,163,164,165,182,186,207,212,214,215,217,218,222,226,230,245,250,267,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,292,303,306,309,310,311,312,313,314,315],$Vj1=[31,32,182,222,250],$Vk1=[31,32,182,222,226,250],$Vl1=[31,32,182,222,226,230,245,250,267,279,280,281,282,283,284,309,310,311,312,313,314,315],$Vm1=[31,32,182,222,226,230,245,250,267,279,280,281,282,283,284,292,306,309,310,311,312,313,314,315],$Vn1=[1,256],$Vo1=[1,257],$Vp1=[1,259],$Vq1=[1,260],$Vr1=[1,261],$Vs1=[1,262],$Vt1=[1,264],$Vu1=[1,265],$Vv1=[2,413],$Vw1=[1,267],$Vx1=[1,268],$Vy1=[1,269],$Vz1=[1,275],$VA1=[1,270],$VB1=[1,271],$VC1=[1,272],$VD1=[1,273],$VE1=[1,274],$VF1=[1,282],$VG1=[1,293],$VH1=[6,41,79,81,83],$VI1=[1,310],$VJ1=[1,309],$VK1=[39,41,83,109,157,158,160,163,164],$VL1=[1,318],$VM1=[1,319],$VN1=[41,109,182,215,303],$VO1=[2,351],$VP1=[13,16,28,29,32,80,165,214,217,218,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285],$VQ1=[13,16,28,29,32,39,41,80,83,109,157,158,160,163,164,165,182,214,215,217,218,250,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,303],$VR1=[13,16,28,29,80,207,245,247,248,249,251,253,254,256,257,260,262,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,309,315,316,317,318,319,320],$VS1=[1,343],$VT1=[1,344],$VU1=[1,346],$VV1=[1,345],$VW1=[6,13,16,28,29,31,32,39,41,68,71,74,76,79,80,81,83,109,157,158,160,163,164,165,182,214,217,218,222,226,230,245,247,248,249,250,251,253,254,256,257,260,262,267,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,292,303,306,309,310,311,312,313,314,315,316,317,318,319,320],$VX1=[1,354],$VY1=[1,353],$VZ1=[29,165],$V_1=[13,16,32,41,80,90,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285],$V$1=[29,41],$V02=[2,312],$V12=[6,41,83],$V22=[6,13,16,29,41,71,79,81,83,247,248,249,251,253,254,256,257,260,262,285,315,316,317,318,319,320],$V32=[6,13,16,28,29,39,41,71,74,76,79,80,81,83,109,157,158,160,163,164,165,214,217,218,247,248,249,251,253,254,256,257,260,262,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,303,315,316,317,318,319,320],$V42=[6,13,16,28,29,41,68,71,79,81,83,247,248,249,251,253,254,256,257,260,262,285,315,316,317,318,319,320],$V52=[6,13,16,28,29,31,32,39,41,61,68,71,74,76,79,80,81,83,109,157,158,160,163,164,165,182,214,217,218,222,226,230,245,247,248,249,250,251,253,254,256,257,260,262,267,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,292,303,304,306,309,310,311,312,313,314,315,316,317,318,319,320],$V62=[13,16,29,186,207,212,285],$V72=[2,363],$V82=[1,395],$V92=[39,41,83,109,157,158,160,163,164,303],$Va2=[13,16,28,29,32,39,41,80,83,109,157,158,160,163,164,165,182,186,214,215,217,218,250,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,303],$Vb2=[13,16,28,29,80,207,245,247,248,249,251,253,254,256,257,260,262,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,292,309,315,316,317,318,319,320],$Vc2=[1,444],$Vd2=[1,441],$Ve2=[1,442],$Vf2=[13,16,28,29,39,41,80,83,109,157,158,160,163,164,165,214,217,218,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285],$Vg2=[13,16,28,285],$Vh2=[13,16,28,29,39,41,80,83,109,157,158,160,163,164,165,214,217,218,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,303],$Vi2=[2,324],$Vj2=[39,41,83,109,157,158,160,163,164,182,215,303],$Vk2=[13,16,32,80,90,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285],$Vl2=[6,13,16,28,29,41,74,76,79,81,83,247,248,249,251,253,254,256,257,260,262,285,315,316,317,318,319,320],$Vm2=[2,319],$Vn2=[13,16,29,186,207,285],$Vo2=[13,16,28,29,41,80,109,165,214,217,218,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285],$Vp2=[13,16,28,29,32,80,165,214,217,218,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,305,306],$Vq2=[13,16,28,29,32,80,165,214,217,218,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,292,305,306,308,309],$Vr2=[1,554],$Vs2=[1,555],$Vt2=[2,307],$Vu2=[13,16,32,186,212,285];
var parser = {trace: function trace () { },
yy: {},
symbols_: {"error":2,"QueryOrUpdate":3,"Prologue":4,"QueryOrUpdate_group0":5,"EOF":6,"Prologue_repetition0":7,"Query":8,"Query_group0":9,"Query_option0":10,"BaseDecl":11,"BASE":12,"IRIREF":13,"PrefixDecl":14,"PREFIX":15,"PNAME_NS":16,"SelectQuery":17,"SelectClause":18,"SelectQuery_repetition0":19,"WhereClause":20,"SolutionModifier":21,"SubSelect":22,"SubSelect_option0":23,"SELECT":24,"SelectClause_option0":25,"SelectClause_group0":26,"SelectClauseItem":27,"VAR":28,"(":29,"Expression":30,"AS":31,")":32,"ConstructQuery":33,"CONSTRUCT":34,"ConstructTemplate":35,"ConstructQuery_repetition0":36,"ConstructQuery_repetition1":37,"WHERE":38,"{":39,"ConstructQuery_option0":40,"}":41,"DescribeQuery":42,"DESCRIBE":43,"DescribeQuery_group0":44,"DescribeQuery_repetition0":45,"DescribeQuery_option0":46,"AskQuery":47,"ASK":48,"AskQuery_repetition0":49,"DatasetClause":50,"FROM":51,"DatasetClause_option0":52,"iri":53,"WhereClause_option0":54,"GroupGraphPattern":55,"SolutionModifier_option0":56,"SolutionModifier_option1":57,"SolutionModifier_option2":58,"SolutionModifier_option3":59,"GroupClause":60,"GROUP":61,"BY":62,"GroupClause_repetition_plus0":63,"GroupCondition":64,"BuiltInCall":65,"FunctionCall":66,"HavingClause":67,"HAVING":68,"HavingClause_repetition_plus0":69,"OrderClause":70,"ORDER":71,"OrderClause_repetition_plus0":72,"OrderCondition":73,"ASC":74,"BrackettedExpression":75,"DESC":76,"Constraint":77,"LimitOffsetClauses":78,"LIMIT":79,"INTEGER":80,"OFFSET":81,"ValuesClause":82,"VALUES":83,"InlineData":84,"InlineData_repetition0":85,"InlineData_repetition1":86,"InlineData_repetition2":87,"DataBlockValue":88,"Literal":89,"UNDEF":90,"DataBlockValueList":91,"DataBlockValueList_repetition0":92,"Update":93,"Update_repetition0":94,"Update1":95,"Update_option0":96,"LOAD":97,"Update1_option0":98,"Update1_option1":99,"Update1_group0":100,"Update1_option2":101,"GraphRefAll":102,"Update1_group1":103,"Update1_option3":104,"GraphOrDefault":105,"TO":106,"CREATE":107,"Update1_option4":108,"GRAPH":109,"INSERTDATA":110,"QuadPattern":111,"DELETEDATA":112,"DELETEWHERE":113,"Update1_option5":114,"InsertClause":115,"Update1_option6":116,"Update1_repetition0":117,"Update1_option7":118,"DeleteClause":119,"Update1_option8":120,"Update1_repetition1":121,"DELETE":122,"INSERT":123,"UsingClause":124,"USING":125,"UsingClause_option0":126,"WithClause":127,"WITH":128,"IntoGraphClause":129,"INTO":130,"DEFAULT":131,"GraphOrDefault_option0":132,"GraphRefAll_group0":133,"QuadPattern_option0":134,"QuadPattern_repetition0":135,"QuadsNotTriples":136,"QuadsNotTriples_group0":137,"QuadsNotTriples_option0":138,"QuadsNotTriples_option1":139,"QuadsNotTriples_option2":140,"TriplesTemplate":141,"TriplesTemplate_repetition0":142,"TriplesSameSubject":143,"TriplesTemplate_option0":144,"GroupGraphPatternSub":145,"GroupGraphPatternSub_option0":146,"GroupGraphPatternSub_repetition0":147,"GroupGraphPatternSubTail":148,"GraphPatternNotTriples":149,"GroupGraphPatternSubTail_option0":150,"GroupGraphPatternSubTail_option1":151,"TriplesBlock":152,"TriplesBlock_repetition0":153,"TriplesSameSubjectPath":154,"TriplesBlock_option0":155,"GraphPatternNotTriples_repetition0":156,"OPTIONAL":157,"MINUS":158,"GraphPatternNotTriples_group0":159,"SERVICE":160,"GraphPatternNotTriples_option0":161,"GraphPatternNotTriples_group1":162,"FILTER":163,"BIND":164,"NIL":165,"FunctionCall_option0":166,"FunctionCall_repetition0":167,"ExpressionList":168,"ExpressionList_repetition0":169,"ConstructTemplate_option0":170,"ConstructTriples":171,"ConstructTriples_repetition0":172,"ConstructTriples_option0":173,"VarOrTerm":174,"PropertyListNotEmpty":175,"TriplesNode":176,"PropertyList":177,"PropertyList_option0":178,"VerbObjectList":179,"PropertyListNotEmpty_repetition0":180,"SemiOptionalVerbObjectList":181,";":182,"SemiOptionalVerbObjectList_option0":183,"Verb":184,"ObjectList":185,"a":186,"ObjectList_repetition0":187,"GraphNode":188,"PropertyListPathNotEmpty":189,"TriplesNodePath":190,"TriplesSameSubjectPath_option0":191,"PropertyListPathNotEmpty_group0":192,"PropertyListPathNotEmpty_repetition0":193,"GraphNodePath":194,"PropertyListPathNotEmpty_repetition1":195,"PropertyListPathNotEmptyTail":196,"PropertyListPathNotEmptyTail_group0":197,"Path":198,"Path_repetition0":199,"PathSequence":200,"PathSequence_repetition0":201,"PathEltOrInverse":202,"PathElt":203,"PathPrimary":204,"PathElt_option0":205,"PathEltOrInverse_option0":206,"!":207,"PathNegatedPropertySet":208,"PathOneInPropertySet":209,"PathNegatedPropertySet_repetition0":210,"PathNegatedPropertySet_option0":211,"^":212,"TriplesNode_repetition_plus0":213,"[":214,"]":215,"TriplesNodePath_repetition_plus0":216,"BLANK_NODE_LABEL":217,"ANON":218,"ConditionalAndExpression":219,"Expression_repetition0":220,"ExpressionTail":221,"||":222,"RelationalExpression":223,"ConditionalAndExpression_repetition0":224,"ConditionalAndExpressionTail":225,"&&":226,"AdditiveExpression":227,"RelationalExpression_group0":228,"RelationalExpression_option0":229,"IN":230,"MultiplicativeExpression":231,"AdditiveExpression_repetition0":232,"AdditiveExpressionTail":233,"AdditiveExpressionTail_group0":234,"NumericLiteralPositive":235,"AdditiveExpressionTail_repetition0":236,"NumericLiteralNegative":237,"AdditiveExpressionTail_repetition1":238,"UnaryExpression":239,"MultiplicativeExpression_repetition0":240,"MultiplicativeExpressionTail":241,"MultiplicativeExpressionTail_group0":242,"UnaryExpression_option0":243,"PrimaryExpression":244,"-":245,"Aggregate":246,"FUNC_ARITY0":247,"FUNC_ARITY1":248,"FUNC_ARITY2":249,",":250,"IF":251,"BuiltInCall_group0":252,"BOUND":253,"BNODE":254,"BuiltInCall_option0":255,"EXISTS":256,"COUNT":257,"Aggregate_option0":258,"Aggregate_group0":259,"FUNC_AGGREGATE":260,"Aggregate_option1":261,"GROUP_CONCAT":262,"Aggregate_option2":263,"Aggregate_option3":264,"GroupConcatSeparator":265,"SEPARATOR":266,"=":267,"String":268,"LANGTAG":269,"^^":270,"DECIMAL":271,"DOUBLE":272,"true":273,"false":274,"STRING_LITERAL1":275,"STRING_LITERAL2":276,"STRING_LITERAL_LONG1":277,"STRING_LITERAL_LONG2":278,"INTEGER_POSITIVE":279,"DECIMAL_POSITIVE":280,"DOUBLE_POSITIVE":281,"INTEGER_NEGATIVE":282,"DECIMAL_NEGATIVE":283,"DOUBLE_NEGATIVE":284,"PNAME_LN":285,"QueryOrUpdate_group0_option0":286,"Prologue_repetition0_group0":287,"SelectClause_option0_group0":288,"DISTINCT":289,"REDUCED":290,"SelectClause_group0_repetition_plus0":291,"*":292,"DescribeQuery_group0_repetition_plus0_group0":293,"DescribeQuery_group0_repetition_plus0":294,"NAMED":295,"SILENT":296,"CLEAR":297,"DROP":298,"ADD":299,"MOVE":300,"COPY":301,"ALL":302,".":303,"UNION":304,"|":305,"/":306,"PathElt_option0_group0":307,"?":308,"+":309,"!=":310,"<":311,">":312,"<=":313,">=":314,"NOT":315,"CONCAT":316,"COALESCE":317,"SUBSTR":318,"REGEX":319,"REPLACE":320,"$accept":0,"$end":1},
terminals_: {2:"error",6:"EOF",12:"BASE",13:"IRIREF",15:"PREFIX",16:"PNAME_NS",24:"SELECT",28:"VAR",29:"(",31:"AS",32:")",34:"CONSTRUCT",38:"WHERE",39:"{",41:"}",43:"DESCRIBE",48:"ASK",51:"FROM",61:"GROUP",62:"BY",68:"HAVING",71:"ORDER",74:"ASC",76:"DESC",79:"LIMIT",80:"INTEGER",81:"OFFSET",83:"VALUES",90:"UNDEF",97:"LOAD",106:"TO",107:"CREATE",109:"GRAPH",110:"INSERTDATA",112:"DELETEDATA",113:"DELETEWHERE",122:"DELETE",123:"INSERT",125:"USING",128:"WITH",130:"INTO",131:"DEFAULT",157:"OPTIONAL",158:"MINUS",160:"SERVICE",163:"FILTER",164:"BIND",165:"NIL",182:";",186:"a",207:"!",212:"^",214:"[",215:"]",217:"BLANK_NODE_LABEL",218:"ANON",222:"||",226:"&&",230:"IN",245:"-",247:"FUNC_ARITY0",248:"FUNC_ARITY1",249:"FUNC_ARITY2",250:",",251:"IF",253:"BOUND",254:"BNODE",256:"EXISTS",257:"COUNT",260:"FUNC_AGGREGATE",262:"GROUP_CONCAT",266:"SEPARATOR",267:"=",269:"LANGTAG",270:"^^",271:"DECIMAL",272:"DOUBLE",273:"true",274:"false",275:"STRING_LITERAL1",276:"STRING_LITERAL2",277:"STRING_LITERAL_LONG1",278:"STRING_LITERAL_LONG2",279:"INTEGER_POSITIVE",280:"DECIMAL_POSITIVE",281:"DOUBLE_POSITIVE",282:"INTEGER_NEGATIVE",283:"DECIMAL_NEGATIVE",284:"DOUBLE_NEGATIVE",285:"PNAME_LN",289:"DISTINCT",290:"REDUCED",292:"*",295:"NAMED",296:"SILENT",297:"CLEAR",298:"DROP",299:"ADD",300:"MOVE",301:"COPY",302:"ALL",303:".",304:"UNION",305:"|",306:"/",308:"?",309:"+",310:"!=",311:"<",312:">",313:"<=",314:">=",315:"NOT",316:"CONCAT",317:"COALESCE",318:"SUBSTR",319:"REGEX",320:"REPLACE"},
productions_: [0,[3,3],[4,1],[8,2],[11,2],[14,3],[17,4],[22,4],[18,3],[27,1],[27,5],[33,5],[33,7],[42,5],[47,4],[50,3],[20,2],[21,4],[60,3],[64,1],[64,1],[64,3],[64,5],[64,1],[67,2],[70,3],[73,2],[73,2],[73,1],[73,1],[78,2],[78,2],[78,4],[78,4],[82,2],[84,4],[84,6],[88,1],[88,1],[88,1],[91,3],[93,3],[95,4],[95,3],[95,5],[95,4],[95,2],[95,2],[95,2],[95,6],[95,6],[119,2],[115,2],[124,3],[127,2],[129,3],[105,1],[105,2],[102,2],[102,1],[111,4],[136,7],[141,3],[55,3],[55,3],[145,2],[148,3],[152,3],[149,2],[149,2],[149,2],[149,3],[149,4],[149,2],[149,6],[149,1],[77,1],[77,1],[77,1],[66,2],[66,6],[168,1],[168,4],[35,3],[171,3],[143,2],[143,2],[177,1],[175,2],[181,2],[179,2],[184,1],[184,1],[184,1],[185,2],[154,2],[154,2],[189,4],[196,1],[196,3],[198,2],[200,2],[203,2],[202,2],[204,1],[204,1],[204,2],[204,3],[208,1],[208,1],[208,4],[209,1],[209,1],[209,2],[209,2],[176,3],[176,3],[190,3],[190,3],[188,1],[188,1],[194,1],[194,1],[174,1],[174,1],[174,1],[174,1],[174,1],[174,1],[30,2],[221,2],[219,2],[225,2],[223,1],[223,3],[223,4],[227,2],[233,2],[233,2],[233,2],[231,2],[241,2],[239,2],[239,2],[239,2],[244,1],[244,1],[244,1],[244,1],[244,1],[244,1],[75,3],[65,1],[65,2],[65,4],[65,6],[65,8],[65,2],[65,4],[65,2],[65,4],[65,3],[246,5],[246,5],[246,6],[265,4],[89,1],[89,2],[89,3],[89,1],[89,1],[89,1],[89,1],[89,1],[89,1],[89,1],[268,1],[268,1],[268,1],[268,1],[235,1],[235,1],[235,1],[237,1],[237,1],[237,1],[53,1],[53,1],[53,1],[286,0],[286,1],[5,1],[5,1],[287,1],[287,1],[7,0],[7,2],[9,1],[9,1],[9,1],[9,1],[10,0],[10,1],[19,0],[19,2],[23,0],[23,1],[288,1],[288,1],[25,0],[25,1],[291,1],[291,2],[26,1],[26,1],[36,0],[36,2],[37,0],[37,2],[40,0],[40,1],[293,1],[293,1],[294,1],[294,2],[44,1],[44,1],[45,0],[45,2],[46,0],[46,1],[49,0],[49,2],[52,0],[52,1],[54,0],[54,1],[56,0],[56,1],[57,0],[57,1],[58,0],[58,1],[59,0],[59,1],[63,1],[63,2],[69,1],[69,2],[72,1],[72,2],[85,0],[85,2],[86,0],[86,2],[87,0],[87,2],[92,0],[92,2],[94,0],[94,4],[96,0],[96,2],[98,0],[98,1],[99,0],[99,1],[100,1],[100,1],[101,0],[101,1],[103,1],[103,1],[103,1],[104,0],[104,1],[108,0],[108,1],[114,0],[114,1],[116,0],[116,1],[117,0],[117,2],[118,0],[118,1],[120,0],[120,1],[121,0],[121,2],[126,0],[126,1],[132,0],[132,1],[133,1],[133,1],[133,1],[134,0],[134,1],[135,0],[135,2],[137,1],[137,1],[138,0],[138,1],[139,0],[139,1],[140,0],[140,1],[142,0],[142,3],[144,0],[144,1],[146,0],[146,1],[147,0],[147,2],[150,0],[150,1],[151,0],[151,1],[153,0],[153,3],[155,0],[155,1],[156,0],[156,3],[159,1],[159,1],[161,0],[161,1],[162,1],[162,1],[166,0],[166,1],[167,0],[167,3],[169,0],[169,3],[170,0],[170,1],[172,0],[172,3],[173,0],[173,1],[178,0],[178,1],[180,0],[180,2],[183,0],[183,1],[187,0],[187,3],[191,0],[191,1],[192,1],[192,1],[193,0],[193,3],[195,0],[195,2],[197,1],[197,1],[199,0],[199,3],[201,0],[201,3],[307,1],[307,1],[307,1],[205,0],[205,1],[206,0],[206,1],[210,0],[210,3],[211,0],[211,1],[213,1],[213,2],[216,1],[216,2],[220,0],[220,2],[224,0],[224,2],[228,1],[228,1],[228,1],[228,1],[228,1],[228,1],[229,0],[229,1],[232,0],[232,2],[234,1],[234,1],[236,0],[236,2],[238,0],[238,2],[240,0],[240,2],[242,1],[242,1],[243,0],[243,1],[252,1],[252,1],[252,1],[252,1],[252,1],[255,0],[255,1],[258,0],[258,1],[259,1],[259,1],[261,0],[261,1],[263,0],[263,1],[264,0],[264,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

      $$[$0-1] = $$[$0-1] || {};
      if (Parser.base)
        $$[$0-1].base = Parser.base;
      Parser.base = base = basePath = baseRoot = '';
      $$[$0-1].prefixes = Parser.prefixes;
      Parser.prefixes = null;
      return $$[$0-1];
    
break;
case 3:
this.$ = extend($$[$0-1], $$[$0], { type: 'query' });
break;
case 4:

      Parser.base = resolveIRI($$[$0])
      base = basePath = baseRoot = '';
    
break;
case 5:

      if (!Parser.prefixes) Parser.prefixes = {};
      $$[$0-1] = $$[$0-1].substr(0, $$[$0-1].length - 1);
      $$[$0] = resolveIRI($$[$0]);
      Parser.prefixes[$$[$0-1]] = $$[$0];
    
break;
case 6:
this.$ = extend($$[$0-3], groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
break;
case 7:
this.$ = extend($$[$0-3], $$[$0-2], $$[$0-1], $$[$0], { type: 'query' });
break;
case 8:
this.$ = extend({ queryType: 'SELECT', variables: $$[$0] === '*' ? ['*'] : $$[$0] }, $$[$0-1] && ($$[$0-2] = lowercase($$[$0-1]), $$[$0-1] = {}, $$[$0-1][$$[$0-2]] = true, $$[$0-1]));
break;
case 9: case 91: case 123: case 150:
this.$ = toVar($$[$0]);
break;
case 10: case 22:
this.$ = expression($$[$0-3], { variable: toVar($$[$0-1]) });
break;
case 11:
this.$ = extend({ queryType: 'CONSTRUCT', template: $$[$0-3] }, groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
break;
case 12:
this.$ = extend({ queryType: 'CONSTRUCT', template: $$[$0-2] = ($$[$0-2] ? $$[$0-2].triples : []) }, groupDatasets($$[$0-5]), { where: [ { type: 'bgp', triples: appendAllTo([], $$[$0-2]) } ] }, $$[$0]);
break;
case 13:
this.$ = extend({ queryType: 'DESCRIBE', variables: $$[$0-3] === '*' ? ['*'] : $$[$0-3].map(toVar) }, groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
break;
case 14:
this.$ = extend({ queryType: 'ASK' }, groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
break;
case 15: case 53:
this.$ = { iri: $$[$0], named: !!$$[$0-1] };
break;
case 16:
this.$ = { where: $$[$0].patterns };
break;
case 17:
this.$ = extend($$[$0-3], $$[$0-2], $$[$0-1], $$[$0]);
break;
case 18:
this.$ = { group: $$[$0] };
break;
case 19: case 20: case 26: case 28:
this.$ = expression($$[$0]);
break;
case 21:
this.$ = expression($$[$0-1]);
break;
case 23: case 29:
this.$ = expression(toVar($$[$0]));
break;
case 24:
this.$ = { having: $$[$0] };
break;
case 25:
this.$ = { order: $$[$0] };
break;
case 27:
this.$ = expression($$[$0], { descending: true });
break;
case 30:
this.$ = { limit:  toInt($$[$0]) };
break;
case 31:
this.$ = { offset: toInt($$[$0]) };
break;
case 32:
this.$ = { limit: toInt($$[$0-2]), offset: toInt($$[$0]) };
break;
case 33:
this.$ = { limit: toInt($$[$0]), offset: toInt($$[$0-2]) };
break;
case 34:
this.$ = { type: 'values', values: $$[$0] };
break;
case 35:

      $$[$0-3] = toVar($$[$0-3]);
      this.$ = $$[$0-1].map(function(v) { var o = {}; o[$$[$0-3]] = v; return o; })
    
break;
case 36:

      var length = $$[$0-4].length;
      $$[$0-4] = $$[$0-4].map(toVar);
      this.$ = $$[$0-1].map(function (values) {
        if (values.length !== length)
          throw Error('Inconsistent VALUES length');
        var valuesObject = {};
        for(var i = 0; i<length; i++)
          valuesObject[$$[$0-4][i]] = values[i];
        return valuesObject;
      });
    
break;
case 39:
this.$ = undefined;
break;
case 40: case 83: case 107: case 151:
this.$ = $$[$0-1];
break;
case 41:
this.$ = { type: 'update', updates: appendTo($$[$0-2], $$[$0-1]) };
break;
case 42:
this.$ = extend({ type: 'load', silent: !!$$[$0-2], source: $$[$0-1] }, $$[$0] && { destination: $$[$0] });
break;
case 43:
this.$ = { type: lowercase($$[$0-2]), silent: !!$$[$0-1], graph: $$[$0] };
break;
case 44:
this.$ = { type: lowercase($$[$0-4]), silent: !!$$[$0-3], source: $$[$0-2], destination: $$[$0] };
break;
case 45:
this.$ = { type: 'create', silent: !!$$[$0-2], graph: $$[$0-1] };
break;
case 46:
this.$ = { updateType: 'insert',      insert: $$[$0] };
break;
case 47:
this.$ = { updateType: 'delete',      delete: $$[$0] };
break;
case 48:
this.$ = { updateType: 'deletewhere', delete: $$[$0] };
break;
case 49:
this.$ = extend({ updateType: 'insertdelete' }, $$[$0-5], { insert: $$[$0-4] || [] }, { delete: $$[$0-3] || [] }, groupDatasets($$[$0-2]), { where: $$[$0].patterns });
break;
case 50:
this.$ = extend({ updateType: 'insertdelete' }, $$[$0-5], { delete: $$[$0-4] || [] }, { insert: $$[$0-3] || [] }, groupDatasets($$[$0-2]), { where: $$[$0].patterns });
break;
case 51: case 52: case 55: case 142:
this.$ = $$[$0];
break;
case 54:
this.$ = { graph: $$[$0] };
break;
case 56:
this.$ = { type: 'graph', default: true };
break;
case 57: case 58:
this.$ = { type: 'graph', name: $$[$0] };
break;
case 59:
 this.$ = {}; this.$[lowercase($$[$0])] = true; 
break;
case 60:
this.$ = $$[$0-2] ? unionAll($$[$0-1], [$$[$0-2]]) : unionAll($$[$0-1]);
break;
case 61:

      var graph = extend($$[$0-3] || { triples: [] }, { type: 'graph', name: toVar($$[$0-5]) });
      this.$ = $$[$0] ? [graph, $$[$0]] : [graph];
    
break;
case 62: case 67:
this.$ = { type: 'bgp', triples: unionAll($$[$0-2], [$$[$0-1]]) };
break;
case 63:
this.$ = { type: 'group', patterns: [ $$[$0-1] ] };
break;
case 64:
this.$ = { type: 'group', patterns: $$[$0-1] };
break;
case 65:
this.$ = $$[$0-1] ? unionAll([$$[$0-1]], $$[$0]) : unionAll($$[$0]);
break;
case 66:
this.$ = $$[$0] ? [$$[$0-2], $$[$0]] : $$[$0-2];
break;
case 68:

      if ($$[$0-1].length)
        this.$ = { type: 'union', patterns: unionAll($$[$0-1].map(degroupSingle), [degroupSingle($$[$0])]) };
      else
        this.$ = $$[$0];
    
break;
case 69:
this.$ = extend($$[$0], { type: 'optional' });
break;
case 70:
this.$ = extend($$[$0], { type: 'minus' });
break;
case 71:
this.$ = extend($$[$0], { type: 'graph', name: toVar($$[$0-1]) });
break;
case 72:
this.$ = extend($$[$0], { type: 'service', name: toVar($$[$0-1]), silent: !!$$[$0-2] });
break;
case 73:
this.$ = { type: 'filter', expression: $$[$0] };
break;
case 74:
this.$ = { type: 'bind', variable: toVar($$[$0-1]), expression: $$[$0-3] };
break;
case 79:
this.$ = { type: 'functionCall', function: $$[$0-1], args: [] };
break;
case 80:
this.$ = { type: 'functionCall', function: $$[$0-5], args: appendTo($$[$0-2], $$[$0-1]), distinct: !!$$[$0-3] };
break;
case 81: case 98: case 109: case 195: case 203: case 215: case 217: case 227: case 231: case 251: case 253: case 255: case 257: case 259: case 282: case 288: case 299: case 309: case 315: case 321: case 325: case 335: case 337: case 341: case 347: case 351: case 357: case 359: case 363: case 365: case 374: case 382: case 384: case 394: case 398: case 400: case 402:
this.$ = [];
break;
case 82:
this.$ = appendTo($$[$0-2], $$[$0-1]);
break;
case 84:
this.$ = unionAll($$[$0-2], [$$[$0-1]]);
break;
case 85: case 95:
this.$ = $$[$0].map(function (t) { return extend(triple($$[$0-1]), t); });
break;
case 86:
this.$ = appendAllTo($$[$0].map(function (t) { return extend(triple($$[$0-1].entity), t); }), $$[$0-1].triples) /* the subject is a blank node, possibly with more triples */;
break;
case 88:
this.$ = unionAll([$$[$0-1]], $$[$0]);
break;
case 89:
this.$ = unionAll($$[$0]);
break;
case 90:
this.$ = objectListToTriples($$[$0-1], $$[$0]);
break;
case 93: case 105: case 112:
this.$ = RDF_TYPE;
break;
case 94:
this.$ = appendTo($$[$0-1], $$[$0]);
break;
case 96:
this.$ = !$$[$0] ? $$[$0-1].triples : appendAllTo($$[$0].map(function (t) { return extend(triple($$[$0-1].entity), t); }), $$[$0-1].triples) /* the subject is a blank node, possibly with more triples */;
break;
case 97:
this.$ = objectListToTriples(toVar($$[$0-3]), appendTo($$[$0-2], $$[$0-1]), $$[$0]);
break;
case 99:
this.$ = objectListToTriples(toVar($$[$0-1]), $$[$0]);
break;
case 100:
this.$ = $$[$0-1].length ? path('|',appendTo($$[$0-1], $$[$0])) : $$[$0];
break;
case 101:
this.$ = $$[$0-1].length ? path('/', appendTo($$[$0-1], $$[$0])) : $$[$0];
break;
case 102:
this.$ = $$[$0] ? path($$[$0], [$$[$0-1]]) : $$[$0-1];
break;
case 103:
this.$ = $$[$0-1] ? path($$[$0-1], [$$[$0]]) : $$[$0];;
break;
case 106: case 113:
this.$ = path($$[$0-1], [$$[$0]]);
break;
case 110:
this.$ = path('|', appendTo($$[$0-2], $$[$0-1]));
break;
case 114:
this.$ = path($$[$0-1], [RDF_TYPE]);
break;
case 115: case 117:
this.$ = createList($$[$0-1]);
break;
case 116: case 118:
this.$ = createAnonymousObject($$[$0-1]);
break;
case 119:
this.$ = { entity: $$[$0], triples: [] } /* for consistency with TriplesNode */;
break;
case 121:
this.$ = { entity: $$[$0], triples: [] } /* for consistency with TriplesNodePath */;
break;
case 127:
this.$ = blank();
break;
case 128:
this.$ = RDF_NIL;
break;
case 129: case 131: case 136: case 140:
this.$ = createOperationTree($$[$0-1], $$[$0]);
break;
case 130:
this.$ = ['||', $$[$0]];
break;
case 132:
this.$ = ['&&', $$[$0]];
break;
case 134:
this.$ = operation($$[$0-1], [$$[$0-2], $$[$0]]);
break;
case 135:
this.$ = operation($$[$0-2] ? 'notin' : 'in', [$$[$0-3], $$[$0]]);
break;
case 137: case 141:
this.$ = [$$[$0-1], $$[$0]];
break;
case 138:
this.$ = ['+', createOperationTree($$[$0-1], $$[$0])];
break;
case 139:
this.$ = ['-', createOperationTree($$[$0-1].replace('-', ''), $$[$0])];
break;
case 143:
this.$ = operation($$[$0-1], [$$[$0]]);
break;
case 144:
this.$ = operation('UMINUS', [$$[$0]]);
break;
case 153:
this.$ = operation(lowercase($$[$0-1]));
break;
case 154:
this.$ = operation(lowercase($$[$0-3]), [$$[$0-1]]);
break;
case 155:
this.$ = operation(lowercase($$[$0-5]), [$$[$0-3], $$[$0-1]]);
break;
case 156:
this.$ = operation(lowercase($$[$0-7]), [$$[$0-5], $$[$0-3], $$[$0-1]]);
break;
case 157:
this.$ = operation(lowercase($$[$0-1]), $$[$0]);
break;
case 158:
this.$ = operation('bound', [toVar($$[$0-1])]);
break;
case 159:
this.$ = operation($$[$0-1], []);
break;
case 160:
this.$ = operation($$[$0-3], [$$[$0-1]]);
break;
case 161:
this.$ = operation($$[$0-2] ? 'notexists' :'exists', [degroupSingle($$[$0])]);
break;
case 162: case 163:
this.$ = expression($$[$0-1], { type: 'aggregate', aggregation: lowercase($$[$0-4]), distinct: !!$$[$0-2] });
break;
case 164:
this.$ = expression($$[$0-2], { type: 'aggregate', aggregation: lowercase($$[$0-5]), distinct: !!$$[$0-3], separator: $$[$0-1] || ' ' });
break;
case 165:
this.$ = $$[$0].substr(1, $$[$0].length - 2);
break;
case 167:
this.$ = $$[$0-1] + lowercase($$[$0]);
break;
case 168:
this.$ = $$[$0-2] + '^^' + $$[$0];
break;
case 169: case 183:
this.$ = createLiteral($$[$0], XSD_INTEGER);
break;
case 170: case 184:
this.$ = createLiteral($$[$0], XSD_DECIMAL);
break;
case 171: case 185:
this.$ = createLiteral(lowercase($$[$0]), XSD_DOUBLE);
break;
case 174:
this.$ = XSD_TRUE;
break;
case 175:
this.$ = XSD_FALSE;
break;
case 176: case 177:
this.$ = unescapeString($$[$0], 1);
break;
case 178: case 179:
this.$ = unescapeString($$[$0], 3);
break;
case 180:
this.$ = createLiteral($$[$0].substr(1), XSD_INTEGER);
break;
case 181:
this.$ = createLiteral($$[$0].substr(1), XSD_DECIMAL);
break;
case 182:
this.$ = createLiteral($$[$0].substr(1).toLowerCase(), XSD_DOUBLE);
break;
case 186:
this.$ = resolveIRI($$[$0]);
break;
case 187:

      var namePos = $$[$0].indexOf(':'),
          prefix = $$[$0].substr(0, namePos),
          expansion = Parser.prefixes[prefix];
      if (!expansion) throw new Error('Unknown prefix: ' + prefix);
      this.$ = resolveIRI(expansion + $$[$0].substr(namePos + 1));
    
break;
case 188:

      $$[$0] = $$[$0].substr(0, $$[$0].length - 1);
      if (!($$[$0] in Parser.prefixes)) throw new Error('Unknown prefix: ' + $$[$0]);
      this.$ = resolveIRI(Parser.prefixes[$$[$0]]);
    
break;
case 196: case 204: case 212: case 216: case 218: case 224: case 228: case 232: case 246: case 248: case 250: case 252: case 254: case 256: case 258: case 283: case 289: case 300: case 316: case 348: case 360: case 379: case 381: case 383: case 385: case 395: case 399: case 401: case 403:
$$[$0-1].push($$[$0]);
break;
case 211: case 223: case 245: case 247: case 249: case 378: case 380:
this.$ = [$$[$0]];
break;
case 260:
$$[$0-3].push($$[$0-2]);
break;
case 310: case 322: case 326: case 336: case 338: case 342: case 352: case 358: case 364: case 366: case 375:
$$[$0-2].push($$[$0-1]);
break;
}
},
table: [o($V0,$V1,{3:1,4:2,7:3}),{1:[3]},o($V2,[2,259],{5:4,8:5,286:6,9:7,93:8,17:9,33:10,42:11,47:12,94:13,18:14,6:[2,189],24:$V3,34:[1,15],43:[1,16],48:[1,17]}),o([6,24,34,43,48,97,107,110,112,113,122,123,128,297,298,299,300,301],[2,2],{287:19,11:20,14:21,12:[1,22],15:[1,23]}),{6:[1,24]},{6:[2,191]},{6:[2,192]},{6:[2,201],10:25,82:26,83:$V4},{6:[2,190]},o($V5,[2,197]),o($V5,[2,198]),o($V5,[2,199]),o($V5,[2,200]),{95:28,97:[1,29],100:30,103:31,107:[1,32],110:[1,33],112:[1,34],113:[1,35],114:36,118:37,122:[2,284],123:[2,278],127:43,128:[1,44],297:[1,38],298:[1,39],299:[1,40],300:[1,41],301:[1,42]},o($V6,[2,203],{19:45}),o($V7,[2,217],{35:46,37:47,39:[1,48]}),{13:$V8,16:$V9,28:$Va,44:49,53:54,285:$Vb,292:[1,51],293:52,294:50},o($V6,[2,231],{49:58}),o($Vc,[2,209],{25:59,288:60,289:[1,61],290:[1,62]}),o($V0,[2,196]),o($V0,[2,193]),o($V0,[2,194]),{13:[1,63]},{16:[1,64]},{1:[2,1]},{6:[2,3]},{6:[2,202]},{28:[1,66],29:[1,67],84:65},{6:[2,261],96:68,182:[1,69]},o($Vd,[2,263],{98:70,296:[1,71]}),o($Ve,[2,269],{101:72,296:[1,73]}),o($Vf,[2,274],{104:74,296:[1,75]}),{108:76,109:[2,276],296:[1,77]},{39:$Vg,111:78},{39:$Vg,111:80},{39:$Vg,111:81},{115:82,123:$Vh},{119:84,122:$Vi},o($Vj,[2,267]),o($Vj,[2,268]),o($Vk,[2,271]),o($Vk,[2,272]),o($Vk,[2,273]),{122:[2,285],123:[2,279]},{13:$V8,16:$V9,53:86,285:$Vb},{20:87,38:$Vl,39:$Vm,50:88,51:$Vn,54:89},o($V6,[2,215],{36:92}),{38:[1,93],50:94,51:$Vn},o($Vo,[2,341],{170:95,171:96,172:97,41:[2,339]}),o($Vp,[2,227],{45:98}),o($Vp,[2,225],{53:54,293:99,13:$V8,16:$V9,28:$Va,285:$Vb}),o($Vp,[2,226]),o($Vq,[2,223]),o($Vq,[2,221]),o($Vq,[2,222]),o($Vr,[2,186]),o($Vr,[2,187]),o($Vr,[2,188]),{20:100,38:$Vl,39:$Vm,50:101,51:$Vn,54:89},{26:102,27:105,28:$Vs,29:$Vt,291:103,292:[1,104]},o($Vc,[2,210]),o($Vc,[2,207]),o($Vc,[2,208]),o($V0,[2,4]),{13:[1,108]},o($Vu,[2,34]),{39:[1,109]},o($Vv,[2,253],{86:110}),{6:[2,41]},o($V0,$V1,{7:3,4:111}),{13:$V8,16:$V9,53:112,285:$Vb},o($Vd,[2,264]),{102:113,109:[1,114],131:[1,116],133:115,295:[1,117],302:[1,118]},o($Ve,[2,270]),o($Vd,$Vw,{105:119,132:121,109:$Vx,131:$Vy}),o($Vf,[2,275]),{109:[1,123]},{109:[2,277]},o($Vz,[2,46]),o($Vo,$VA,{134:124,141:125,142:126,41:$VB,109:$VB}),o($Vz,[2,47]),o($Vz,[2,48]),o($VC,[2,280],{116:127,119:128,122:$Vi}),{39:$Vg,111:129},o($VC,[2,286],{120:130,115:131,123:$Vh}),{39:$Vg,111:132},o([122,123],[2,54]),o($VD,$VE,{21:133,56:134,60:135,61:$VF}),o($V6,[2,204]),{39:$VG,55:137},o($Vd,[2,233],{52:139,295:[1,140]}),{39:[2,236]},{20:141,38:$Vl,39:$Vm,50:142,51:$Vn,54:89},{39:[1,143]},o($V7,[2,218]),{41:[1,144]},{41:[2,340]},{13:$V8,16:$V9,28:$VH,29:$VI,53:149,80:$VJ,89:150,143:145,165:$VK,174:146,176:147,214:$VL,217:$VM,218:$VN,235:160,237:161,268:156,271:$VO,272:$VP,273:$VQ,274:$VR,275:$VS,276:$VT,277:$VU,278:$VV,279:$VW,280:$VX,281:$VY,282:$VZ,283:$V_,284:$V$,285:$Vb},o($V01,[2,229],{54:89,46:174,50:175,20:176,38:$Vl,39:$Vm,51:$Vn}),o($Vq,[2,224]),o($VD,$VE,{56:134,60:135,21:177,61:$VF}),o($V6,[2,232]),o($V6,[2,8]),o($V6,[2,213],{27:178,28:$Vs,29:$Vt}),o($V6,[2,214]),o($V11,[2,211]),o($V11,[2,9]),o($V21,$V31,{30:179,219:180,223:181,227:182,231:183,239:184,243:185,207:$V41,245:$V51,309:$V61}),o($V0,[2,5]),o($V71,[2,251],{85:189}),{28:[1,191],32:[1,190]},o($V2,[2,260],{6:[2,262]}),o($Vz,[2,265],{99:192,129:193,130:[1,194]}),o($Vz,[2,43]),{13:$V8,16:$V9,53:195,285:$Vb},o($Vz,[2,59]),o($Vz,[2,294]),o($Vz,[2,295]),o($Vz,[2,296]),{106:[1,196]},o($V81,[2,56]),{13:$V8,16:$V9,53:197,285:$Vb},o($Vd,[2,293]),{13:$V8,16:$V9,53:198,285:$Vb},o($V91,[2,299],{135:199}),o($V91,[2,298]),{13:$V8,16:$V9,28:$VH,29:$VI,53:149,80:$VJ,89:150,143:200,165:$VK,174:146,176:147,214:$VL,217:$VM,218:$VN,235:160,237:161,268:156,271:$VO,272:$VP,273:$VQ,274:$VR,275:$VS,276:$VT,277:$VU,278:$VV,279:$VW,280:$VX,281:$VY,282:$VZ,283:$V_,284:$V$,285:$Vb},o($VC,[2,282],{117:201}),o($VC,[2,281]),o([38,122,125],[2,52]),o($VC,[2,288],{121:202}),o($VC,[2,287]),o([38,123,125],[2,51]),o($V5,[2,6]),o($Va1,[2,239],{57:203,67:204,68:[1,205]}),o($VD,[2,238]),{62:[1,206]},o([6,41,61,68,71,79,81,83],[2,16]),o($Vo,$Vb1,{22:207,145:208,18:209,146:210,152:211,153:212,24:$V3,39:$Vc1,41:$Vc1,83:$Vc1,109:$Vc1,157:$Vc1,158:$Vc1,160:$Vc1,163:$Vc1,164:$Vc1}),{13:$V8,16:$V9,53:213,285:$Vb},o($Vd,[2,234]),o($VD,$VE,{56:134,60:135,21:214,61:$VF}),o($V6,[2,216]),o($Vo,$VA,{142:126,40:215,141:216,41:[2,219]}),o($V6,[2,83]),{41:[2,343],173:217,303:[1,218]},{13:$V8,16:$V9,28:$Vd1,53:223,175:219,179:220,184:221,186:$Ve1,285:$Vb},o($Vf1,[2,345],{179:220,184:221,53:223,177:225,178:226,175:227,13:$V8,16:$V9,28:$Vd1,186:$Ve1,285:$Vb}),o($Vg1,[2,123]),o($Vg1,[2,124]),o($Vg1,[2,125]),o($Vg1,[2,126]),o($Vg1,[2,127]),o($Vg1,[2,128]),{13:$V8,16:$V9,28:$VH,29:$VI,53:149,80:$VJ,89:150,165:$VK,174:230,176:231,188:229,213:228,214:$VL,217:$VM,218:$VN,235:160,237:161,268:156,271:$VO,272:$VP,273:$VQ,274:$VR,275:$VS,276:$VT,277:$VU,278:$VV,279:$VW,280:$VX,281:$VY,282:$VZ,283:$V_,284:$V$,285:$Vb},{13:$V8,16:$V9,28:$Vd1,53:223,175:232,179:220,184:221,186:$Ve1,285:$Vb},o($Vh1,[2,166],{269:[1,233],270:[1,234]}),o($Vh1,[2,169]),o($Vh1,[2,170]),o($Vh1,[2,171]),o($Vh1,[2,172]),o($Vh1,[2,173]),o($Vh1,[2,174]),o($Vh1,[2,175]),o($Vi1,[2,176]),o($Vi1,[2,177]),o($Vi1,[2,178]),o($Vi1,[2,179]),o($Vh1,[2,180]),o($Vh1,[2,181]),o($Vh1,[2,182]),o($Vh1,[2,183]),o($Vh1,[2,184]),o($Vh1,[2,185]),o($VD,$VE,{56:134,60:135,21:235,61:$VF}),o($Vp,[2,228]),o($V01,[2,230]),o($V5,[2,14]),o($V11,[2,212]),{31:[1,236]},o($Vj1,[2,382],{220:237}),o($Vk1,[2,384],{224:238}),o($Vk1,[2,133],{228:239,229:240,230:[2,392],267:[1,241],310:[1,242],311:[1,243],312:[1,244],313:[1,245],314:[1,246],315:[1,247]}),o($Vl1,[2,394],{232:248}),o($Vm1,[2,402],{240:249}),{13:$V8,16:$V9,28:$Vn1,29:$Vo1,53:253,65:252,66:254,75:251,80:$VJ,89:255,235:160,237:161,244:250,246:258,247:$Vp1,248:$Vq1,249:$Vr1,251:$Vs1,252:263,253:$Vt1,254:$Vu1,255:266,256:$Vv1,257:$Vw1,260:$Vx1,262:$Vy1,268:156,271:$VO,272:$VP,273:$VQ,274:$VR,275:$VS,276:$VT,277:$VU,278:$VV,279:$VW,280:$VX,281:$VY,282:$VZ,283:$V_,284:$V$,285:$Vb,315:$Vz1,316:$VA1,317:$VB1,318:$VC1,319:$VD1,320:$VE1},{13:$V8,16:$V9,28:$Vn1,29:$Vo1,53:253,65:252,66:254,75:251,80:$VJ,89:255,235:160,237:161,244:276,246:258,247:$Vp1,248:$Vq1,249:$Vr1,251:$Vs1,252:263,253:$Vt1,254:$Vu1,255:266,256:$Vv1,257:$Vw1,260:$Vx1,262:$Vy1,268:156,271:$VO,272:$VP,273:$VQ,274:$VR,275:$VS,276:$VT,277:$VU,278:$VV,279:$VW,280:$VX,281:$VY,282:$VZ,283:$V_,284:$V$,285:$Vb,315:$Vz1,316:$VA1,317:$VB1,318:$VC1,319:$VD1,320:$VE1},{13:$V8,16:$V9,28:$Vn1,29:$Vo1,53:253,65:252,66:254,75:251,80:$VJ,89:255,235:160,237:161,244:277,246:258,247:$Vp1,248:$Vq1,249:$Vr1,251:$Vs1,252:263,253:$Vt1,254:$Vu1,255:266,256:$Vv1,257:$Vw1,260:$Vx1,262:$Vy1,268:156,271:$VO,272:$VP,273:$VQ,274:$VR,275:$VS,276:$VT,277:$VU,278:$VV,279:$VW,280:$VX,281:$VY,282:$VZ,283:$V_,284:$V$,285:$Vb,315:$Vz1,316:$VA1,317:$VB1,318:$VC1,319:$VD1,320:$VE1},o($V21,[2,407]),{13:$V8,16:$V9,41:[1,278],53:280,80:$VJ,88:279,89:281,90:$VF1,235:160,237:161,268:156,271:$VO,272:$VP,273:$VQ,274:$VR,275:$VS,276:$VT,277:$VU,278:$VV,279:$VW,280:$VX,281:$VY,282:$VZ,283:$V_,284:$V$,285:$Vb},{39:[1,283]},o($Vv,[2,254]),o($Vz,[2,42]),o($Vz,[2,266]),{109:[1,284]},o($Vz,[2,58]),o($Vd,$Vw,{132:121,105:285,109:$Vx,131:$Vy}),o($V81,[2,57]),o($Vz,[2,45]),{41:[1,286],109:[1,288],136:287},o($V91,[2,311],{144:289,303:[1,290]}),{38:[1,291],124:292,125:$VG1},{38:[1,294],124:295,125:$VG1},o($VH1,[2,241],{58:296,70:297,71:[1,298]}),o($Va1,[2,240]),{13:$V8,16:$V9,29:$Vo1,53:304,65:302,66:303,69:299,75:301,77:300,246:258,247:$Vp1,248:$Vq1,249:$Vr1,251:$Vs1,252:263,253:$Vt1,254:$Vu1,255:266,256:$Vv1,257:$Vw1,260:$Vx1,262:$Vy1,285:$Vb,315:$Vz1,316:$VA1,317:$VB1,318:$VC1,319:$VD1,320:$VE1},{13:$V8,16:$V9,28:$VI1,29:$VJ1,53:304,63:305,64:306,65:307,66:308,246:258,247:$Vp1,248:$Vq1,249:$Vr1,251:$Vs1,252:263,253:$Vt1,254:$Vu1,255:266,256:$Vv1,257:$Vw1,260:$Vx1,262:$Vy1,285:$Vb,315:$Vz1,316:$VA1,317:$VB1,318:$VC1,319:$VD1,320:$VE1},{41:[1,311]},{41:[1,312]},{20:313,38:$Vl,39:$Vm,54:89},o($VK1,[2,315],{147:314}),o($VK1,[2,314]),{13:$V8,16:$V9,28:$VH,29:$VL1,53:149,80:$VJ,89:150,154:315,165:$VK,174:316,190:317,214:$VM1,217:$VM,218:$VN,235:160,237:161,268:156,271:$VO,272:$VP,273:$VQ,274:$VR,275:$VS,276:$VT,277:$VU,278:$VV,279:$VW,280:$VX,281:$VY,282:$VZ,283:$V_,284:$V$,285:$Vb},o($Vp,[2,15]),o($V5,[2,11]),{41:[1,320]},{41:[2,220]},{41:[2,84]},o($Vo,[2,342],{41:[2,344]}),o($Vf1,[2,85]),o($VN1,[2,347],{180:321}),o($Vo,$VO1,{185:322,187:323}),o($Vo,[2,91]),o($Vo,[2,92]),o($Vo,[2,93]),o($Vf1,[2,86]),o($Vf1,[2,87]),o($Vf1,[2,346]),{13:$V8,16:$V9,28:$VH,29:$VI,32:[1,324],53:149,80:$VJ,89:150,165:$VK,174:230,176:231,188:325,214:$VL,217:$VM,218:$VN,235:160,237:161,268:156,271:$VO,272:$VP,273:$VQ,274:$VR,275:$VS,276:$VT,277:$VU,278:$VV,279:$VW,280:$VX,281:$VY,282:$VZ,283:$V_,284:$V$,285:$Vb},o($VP1,[2,378]),o($VQ1,[2,119]),o($VQ1,[2,120]),{215:[1,326]},o($Vh1,[2,167]),{13:$V8,16:$V9,53:327,285:$Vb},o($V5,[2,13]),{28:[1,328]},o([31,32,182,250],[2,129],{221:329,222:[1,330]}),o($Vj1,[2,131],{225:331,226:[1,332]}),o($V21,$V31,{231:183,239:184,243:185,227:333,207:$V41,245:$V51,309:$V61}),{230:[1,334]},o($VR1,[2,386]),o($VR1,[2,387]),o($VR1,[2,388]),o($VR1,[2,389]),o($VR1,[2,390]),o($VR1,[2,391]),{230:[2,393]},o([31,32,182,222,226,230,250,267,310,311,312,313,314,315],[2,136],{233:335,234:336,235:337,237:338,245:[1,340],279:$VW,280:$VX,281:$VY,282:$VZ,283:$V_,284:$V$,309:[1,339]}),o($Vl1,[2,140],{241:341,242:342,292:$VS1,306:$VT1}),o($Vm1,[2,142]),o($Vm1,[2,145]),o($Vm1,[2,146]),o($Vm1,[2,147],{29:$VU1,165:$VV1}),o($Vm1,[2,148]),o($Vm1,[2,149]),o($Vm1,[2,150]),o($V21,$V31,{219:180,223:181,227:182,231:183,239:184,243:185,30:347,207:$V41,245:$V51,309:$V61}),o($VW1,[2,152]),{165:[1,348]},{29:[1,349]},{29:[1,350]},{29:[1,351]},{29:$VX1,165:$VY1,168:352},{29:[1,355]},{29:[1,357],165:[1,356]},{256:[1,358]},{29:[1,359]},{29:[1,360]},{29:[1,361]},o($VZ1,[2,408]),o($VZ1,[2,409]),o($VZ1,[2,410]),o($VZ1,[2,411]),o($VZ1,[2,412]),{256:[2,414]},o($Vm1,[2,143]),o($Vm1,[2,144]),o($Vu,[2,35]),o($V71,[2,252]),o($V_1,[2,37]),o($V_1,[2,38]),o($V_1,[2,39]),o($V$1,[2,255],{87:362}),{13:$V8,16:$V9,53:363,285:$Vb},o($Vz,[2,44]),o([6,38,122,123,125,182],[2,60]),o($V91,[2,300]),{13:$V8,16:$V9,28:[1,365],53:366,137:364,285:$Vb},o($V91,[2,62]),o($Vo,[2,310],{41:$V02,109:$V02}),{39:$VG,55:367},o($VC,[2,283]),o($Vd,[2,290],{126:368,295:[1,369]}),{39:$VG,55:370},o($VC,[2,289]),o($V12,[2,243],{59:371,78:372,79:[1,373],81:[1,374]}),o($VH1,[2,242]),{62:[1,375]},o($Va1,[2,24],{246:258,252:263,255:266,75:301,65:302,66:303,53:304,77:376,13:$V8,16:$V9,29:$Vo1,247:$Vp1,248:$Vq1,249:$Vr1,251:$Vs1,253:$Vt1,254:$Vu1,256:$Vv1,257:$Vw1,260:$Vx1,262:$Vy1,285:$Vb,315:$Vz1,316:$VA1,317:$VB1,318:$VC1,319:$VD1,320:$VE1}),o($V22,[2,247]),o($V32,[2,76]),o($V32,[2,77]),o($V32,[2,78]),{29:$VU1,165:$VV1},o($VD,[2,18],{246:258,252:263,255:266,53:304,65:307,66:308,64:377,13:$V8,16:$V9,28:$VI1,29:$VJ1,247:$Vp1,248:$Vq1,249:$Vr1,251:$Vs1,253:$Vt1,254:$Vu1,256:$Vv1,257:$Vw1,260:$Vx1,262:$Vy1,285:$Vb,315:$Vz1,316:$VA1,317:$VB1,318:$VC1,319:$VD1,320:$VE1}),o($V42,[2,245]),o($V42,[2,19]),o($V42,[2,20]),o($V21,$V31,{219:180,223:181,227:182,231:183,239:184,243:185,30:378,207:$V41,245:$V51,309:$V61}),o($V42,[2,23]),o($V52,[2,63]),o($V52,[2,64]),o($VD,$VE,{56:134,60:135,21:379,61:$VF}),{39:[2,325],41:[2,65],82:389,83:$V4,109:[1,385],148:380,149:381,156:382,157:[1,383],158:[1,384],160:[1,386],163:[1,387],164:[1,388]},o($VK1,[2,323],{155:390,303:[1,391]}),o($V62,$V72,{189:392,192:393,198:394,199:396,28:$V82}),o($V92,[2,353],{192:393,198:394,199:396,191:397,189:398,13:$V72,16:$V72,29:$V72,186:$V72,207:$V72,212:$V72,285:$V72,28:$V82}),{13:$V8,16:$V9,28:$VH,29:$VL1,53:149,80:$VJ,89:150,165:$VK,174:401,190:402,194:400,214:$VM1,216:399,217:$VM,218:$VN,235:160,237:161,268:156,271:$VO,272:$VP,273:$VQ,274:$VR,275:$VS,276:$VT,277:$VU,278:$VV,279:$VW,280:$VX,281:$VY,282:$VZ,283:$V_,284:$V$,285:$Vb},o($V62,$V72,{192:393,198:394,199:396,189:403,28:$V82}),o($VD,$VE,{56:134,60:135,21:404,61:$VF}),o([41,109,215,303],[2,88],{181:405,182:[1,406]}),o($VN1,[2,90]),{13:$V8,16:$V9,28:$VH,29:$VI,53:149,80:$VJ,89:150,165:$VK,174:230,176:231,188:407,214:$VL,217:$VM,218:$VN,235:160,237:161,268:156,271:$VO,272:$VP,273:$VQ,274:$VR,275:$VS,276:$VT,277:$VU,278:$VV,279:$VW,280:$VX,281:$VY,282:$VZ,283:$V_,284:$V$,285:$Vb},o($Va2,[2,115]),o($VP1,[2,379]),o($Va2,[2,116]),o($Vh1,[2,168]),{32:[1,408]},o($Vj1,[2,383]),o($V21,$V31,{223:181,227:182,231:183,239:184,243:185,219:409,207:$V41,245:$V51,309:$V61}),o($Vk1,[2,385]),o($V21,$V31,{227:182,231:183,239:184,243:185,223:410,207:$V41,245:$V51,309:$V61}),o($Vk1,[2,134]),{29:$VX1,165:$VY1,168:411},o($Vl1,[2,395]),o($V21,$V31,{239:184,243:185,231:412,207:$V41,245:$V51,309:$V61}),o($Vm1,[2,398],{236:413}),o($Vm1,[2,400],{238:414}),o($VR1,[2,396]),o($VR1,[2,397]),o($Vm1,[2,403]),o($V21,$V31,{243:185,239:415,207:$V41,245:$V51,309:$V61}),o($VR1,[2,404]),o($VR1,[2,405]),o($VW1,[2,79]),o($VR1,[2,333],{166:416,289:[1,417]}),{32:[1,418]},o($VW1,[2,153]),o($V21,$V31,{219:180,223:181,227:182,231:183,239:184,243:185,30:419,207:$V41,245:$V51,309:$V61}),o($V21,$V31,{219:180,223:181,227:182,231:183,239:184,243:185,30:420,207:$V41,245:$V51,309:$V61}),o($V21,$V31,{219:180,223:181,227:182,231:183,239:184,243:185,30:421,207:$V41,245:$V51,309:$V61}),o($VW1,[2,157]),o($VW1,[2,81]),o($VR1,[2,337],{169:422}),{28:[1,423]},o($VW1,[2,159]),o($V21,$V31,{219:180,223:181,227:182,231:183,239:184,243:185,30:424,207:$V41,245:$V51,309:$V61}),{39:$VG,55:425},o($Vb2,[2,415],{258:426,289:[1,427]}),o($VR1,[2,419],{261:428,289:[1,429]}),o($VR1,[2,421],{263:430,289:[1,431]}),{29:[1,434],41:[1,432],91:433},o($Vz,[2,55]),{39:[1,435]},{39:[2,301]},{39:[2,302]},o($Vz,[2,49]),{13:$V8,16:$V9,53:436,285:$Vb},o($Vd,[2,291]),o($Vz,[2,50]),o($V12,[2,17]),o($V12,[2,244]),{80:[1,437]},{80:[1,438]},{13:$V8,16:$V9,28:$Vc2,29:$Vo1,53:304,65:302,66:303,72:439,73:440,74:$Vd2,75:301,76:$Ve2,77:443,246:258,247:$Vp1,248:$Vq1,249:$Vr1,251:$Vs1,252:263,253:$Vt1,254:$Vu1,255:266,256:$Vv1,257:$Vw1,260:$Vx1,262:$Vy1,285:$Vb,315:$Vz1,316:$VA1,317:$VB1,318:$VC1,319:$VD1,320:$VE1},o($V22,[2,248]),o($V42,[2,246]),{31:[1,446],32:[1,445]},{23:447,41:[2,205],82:448,83:$V4},o($VK1,[2,316]),o($Vf2,[2,317],{150:449,303:[1,450]}),{39:$VG,55:451},{39:$VG,55:452},{39:$VG,55:453},{13:$V8,16:$V9,28:[1,455],53:456,159:454,285:$Vb},o($Vg2,[2,329],{161:457,296:[1,458]}),{13:$V8,16:$V9,29:$Vo1,53:304,65:302,66:303,75:301,77:459,246:258,247:$Vp1,248:$Vq1,249:$Vr1,251:$Vs1,252:263,253:$Vt1,254:$Vu1,255:266,256:$Vv1,257:$Vw1,260:$Vx1,262:$Vy1,285:$Vb,315:$Vz1,316:$VA1,317:$VB1,318:$VC1,319:$VD1,320:$VE1},{29:[1,460]},o($Vh2,[2,75]),o($VK1,[2,67]),o($Vo,[2,322],{39:$Vi2,41:$Vi2,83:$Vi2,109:$Vi2,157:$Vi2,158:$Vi2,160:$Vi2,163:$Vi2,164:$Vi2}),o($V92,[2,95]),o($Vo,[2,357],{193:461}),o($Vo,[2,355]),o($Vo,[2,356]),o($V62,[2,365],{200:462,201:463}),o($V92,[2,96]),o($V92,[2,354]),{13:$V8,16:$V9,28:$VH,29:$VL1,32:[1,464],53:149,80:$VJ,89:150,165:$VK,174:401,190:402,194:465,214:$VM1,217:$VM,218:$VN,235:160,237:161,268:156,271:$VO,272:$VP,273:$VQ,274:$VR,275:$VS,276:$VT,277:$VU,278:$VV,279:$VW,280:$VX,281:$VY,282:$VZ,283:$V_,284:$V$,285:$Vb},o($VP1,[2,380]),o($VQ1,[2,121]),o($VQ1,[2,122]),{215:[1,466]},o($V5,[2,12]),o($VN1,[2,348]),o($VN1,[2,349],{184:221,53:223,183:467,179:468,13:$V8,16:$V9,28:$Vd1,186:$Ve1,285:$Vb}),o($Vj2,[2,94],{250:[1,469]}),o($V11,[2,10]),o($Vj1,[2,130]),o($Vk1,[2,132]),o($Vk1,[2,135]),o($Vl1,[2,137]),o($Vl1,[2,138],{242:342,241:470,292:$VS1,306:$VT1}),o($Vl1,[2,139],{242:342,241:471,292:$VS1,306:$VT1}),o($Vm1,[2,141]),o($VR1,[2,335],{167:472}),o($VR1,[2,334]),o([6,13,16,28,29,31,32,39,41,71,74,76,79,80,81,83,109,157,158,160,163,164,165,182,214,217,218,222,226,230,245,247,248,249,250,251,253,254,256,257,260,262,267,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,292,303,306,309,310,311,312,313,314,315,316,317,318,319,320],[2,151]),{32:[1,473]},{250:[1,474]},{250:[1,475]},o($V21,$V31,{219:180,223:181,227:182,231:183,239:184,243:185,30:476,207:$V41,245:$V51,309:$V61}),{32:[1,477]},{32:[1,478]},o($VW1,[2,161]),o($V21,$V31,{219:180,223:181,227:182,231:183,239:184,243:185,259:479,30:481,207:$V41,245:$V51,292:[1,480],309:$V61}),o($Vb2,[2,416]),o($V21,$V31,{219:180,223:181,227:182,231:183,239:184,243:185,30:482,207:$V41,245:$V51,309:$V61}),o($VR1,[2,420]),o($V21,$V31,{219:180,223:181,227:182,231:183,239:184,243:185,30:483,207:$V41,245:$V51,309:$V61}),o($VR1,[2,422]),o($Vu,[2,36]),o($V$1,[2,256]),o($Vk2,[2,257],{92:484}),o($Vo,$VA,{142:126,138:485,141:486,41:[2,303]}),o($VC,[2,53]),o($V12,[2,30],{81:[1,487]}),o($V12,[2,31],{79:[1,488]}),o($VH1,[2,25],{246:258,252:263,255:266,75:301,65:302,66:303,53:304,77:443,73:489,13:$V8,16:$V9,28:$Vc2,29:$Vo1,74:$Vd2,76:$Ve2,247:$Vp1,248:$Vq1,249:$Vr1,251:$Vs1,253:$Vt1,254:$Vu1,256:$Vv1,257:$Vw1,260:$Vx1,262:$Vy1,285:$Vb,315:$Vz1,316:$VA1,317:$VB1,318:$VC1,319:$VD1,320:$VE1}),o($Vl2,[2,249]),{29:$Vo1,75:490},{29:$Vo1,75:491},o($Vl2,[2,28]),o($Vl2,[2,29]),o($V42,[2,21]),{28:[1,492]},{41:[2,7]},{41:[2,206]},o($Vo,$Vb1,{153:212,151:493,152:494,39:$Vm2,41:$Vm2,83:$Vm2,109:$Vm2,157:$Vm2,158:$Vm2,160:$Vm2,163:$Vm2,164:$Vm2}),o($Vf2,[2,318]),o($Vh2,[2,68],{304:[1,495]}),o($Vh2,[2,69]),o($Vh2,[2,70]),{39:$VG,55:496},{39:[2,327]},{39:[2,328]},{13:$V8,16:$V9,28:[1,498],53:499,162:497,285:$Vb},o($Vg2,[2,330]),o($Vh2,[2,73]),o($V21,$V31,{219:180,223:181,227:182,231:183,239:184,243:185,30:500,207:$V41,245:$V51,309:$V61}),{13:$V8,16:$V9,28:$VH,29:$VL1,53:149,80:$VJ,89:150,165:$VK,174:401,190:402,194:501,214:$VM1,217:$VM,218:$VN,235:160,237:161,268:156,271:$VO,272:$VP,273:$VQ,274:$VR,275:$VS,276:$VT,277:$VU,278:$VV,279:$VW,280:$VX,281:$VY,282:$VZ,283:$V_,284:$V$,285:$Vb},o($VP1,[2,100],{305:[1,502]}),o($Vn2,[2,372],{202:503,206:504,212:[1,505]}),o($Vg1,[2,117]),o($VP1,[2,381]),o($Vg1,[2,118]),o($VN1,[2,89]),o($VN1,[2,350]),o($Vo,[2,352]),o($Vm1,[2,399]),o($Vm1,[2,401]),o($V21,$V31,{219:180,223:181,227:182,231:183,239:184,243:185,30:506,207:$V41,245:$V51,309:$V61}),o($VW1,[2,154]),o($V21,$V31,{219:180,223:181,227:182,231:183,239:184,243:185,30:507,207:$V41,245:$V51,309:$V61}),o($V21,$V31,{219:180,223:181,227:182,231:183,239:184,243:185,30:508,207:$V41,245:$V51,309:$V61}),{32:[1,509],250:[1,510]},o($VW1,[2,158]),o($VW1,[2,160]),{32:[1,511]},{32:[2,417]},{32:[2,418]},{32:[1,512]},{32:[2,423],182:[1,515],264:513,265:514},{13:$V8,16:$V9,32:[1,516],53:280,80:$VJ,88:517,89:281,90:$VF1,235:160,237:161,268:156,271:$VO,272:$VP,273:$VQ,274:$VR,275:$VS,276:$VT,277:$VU,278:$VV,279:$VW,280:$VX,281:$VY,282:$VZ,283:$V_,284:$V$,285:$Vb},{41:[1,518]},{41:[2,304]},{80:[1,519]},{80:[1,520]},o($Vl2,[2,250]),o($Vl2,[2,26]),o($Vl2,[2,27]),{32:[1,521]},o($VK1,[2,66]),o($VK1,[2,320]),{39:[2,326]},o($Vh2,[2,71]),{39:$VG,55:522},{39:[2,331]},{39:[2,332]},{31:[1,523]},o($Vj2,[2,359],{195:524,250:[1,525]}),o($V62,[2,364]),o([13,16,28,29,32,80,165,214,217,218,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,305],[2,101],{306:[1,526]}),{13:$V8,16:$V9,29:[1,532],53:529,186:[1,530],203:527,204:528,207:[1,531],285:$Vb},o($Vn2,[2,373]),{32:[1,533],250:[1,534]},{32:[1,535]},{250:[1,536]},o($VW1,[2,82]),o($VR1,[2,338]),o($VW1,[2,162]),o($VW1,[2,163]),{32:[1,537]},{32:[2,424]},{266:[1,538]},o($V$1,[2,40]),o($Vk2,[2,258]),o($Vo2,[2,305],{139:539,303:[1,540]}),o($V12,[2,32]),o($V12,[2,33]),o($V42,[2,22]),o($Vh2,[2,72]),{28:[1,541]},o([39,41,83,109,157,158,160,163,164,215,303],[2,97],{196:542,182:[1,543]}),o($Vo,[2,358]),o($V62,[2,366]),o($Vp2,[2,103]),o($Vp2,[2,370],{205:544,307:545,292:[1,547],308:[1,546],309:[1,548]}),o($Vq2,[2,104]),o($Vq2,[2,105]),{13:$V8,16:$V9,29:[1,552],53:553,165:[1,551],186:$Vr2,208:549,209:550,212:$Vs2,285:$Vb},o($V62,$V72,{199:396,198:556}),o($VW1,[2,80]),o($VR1,[2,336]),o($VW1,[2,155]),o($V21,$V31,{219:180,223:181,227:182,231:183,239:184,243:185,30:557,207:$V41,245:$V51,309:$V61}),o($VW1,[2,164]),{267:[1,558]},o($Vo,$VA,{142:126,140:559,141:560,41:$Vt2,109:$Vt2}),o($Vo2,[2,306]),{32:[1,561]},o($Vj2,[2,360]),o($Vj2,[2,98],{199:396,197:562,198:563,13:$V72,16:$V72,29:$V72,186:$V72,207:$V72,212:$V72,285:$V72,28:[1,564]}),o($Vp2,[2,102]),o($Vp2,[2,371]),o($Vp2,[2,367]),o($Vp2,[2,368]),o($Vp2,[2,369]),o($Vq2,[2,106]),o($Vq2,[2,108]),o($Vq2,[2,109]),o($Vu2,[2,374],{210:565}),o($Vq2,[2,111]),o($Vq2,[2,112]),{13:$V8,16:$V9,53:566,186:[1,567],285:$Vb},{32:[1,568]},{32:[1,569]},{268:570,275:$VS,276:$VT,277:$VU,278:$VV},o($V91,[2,61]),o($V91,[2,308]),o($Vh2,[2,74]),o($Vo,$VO1,{187:323,185:571}),o($Vo,[2,361]),o($Vo,[2,362]),{13:$V8,16:$V9,32:[2,376],53:553,186:$Vr2,209:573,211:572,212:$Vs2,285:$Vb},o($Vq2,[2,113]),o($Vq2,[2,114]),o($Vq2,[2,107]),o($VW1,[2,156]),{32:[2,165]},o($Vj2,[2,99]),{32:[1,574]},{32:[2,377],305:[1,575]},o($Vq2,[2,110]),o($Vu2,[2,375])],
defaultActions: {5:[2,191],6:[2,192],8:[2,190],24:[2,1],25:[2,3],26:[2,202],68:[2,41],77:[2,277],91:[2,236],96:[2,340],216:[2,220],217:[2,84],247:[2,393],275:[2,414],365:[2,301],366:[2,302],447:[2,7],448:[2,206],455:[2,327],456:[2,328],480:[2,417],481:[2,418],486:[2,304],495:[2,326],498:[2,331],499:[2,332],514:[2,424],570:[2,165]},
parseError: function parseError (str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        var error = new Error(str);
        error.hash = hash;
        throw error;
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        var lex = function () {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        };
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

  /*
    SPARQL parser in the Jison parser generator format.
  */

  // Common namespaces and entities
  var RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      RDF_TYPE  = RDF + 'type',
      RDF_FIRST = RDF + 'first',
      RDF_REST  = RDF + 'rest',
      RDF_NIL   = RDF + 'nil',
      XSD = 'http://www.w3.org/2001/XMLSchema#',
      XSD_INTEGER  = XSD + 'integer',
      XSD_DECIMAL  = XSD + 'decimal',
      XSD_DOUBLE   = XSD + 'double',
      XSD_BOOLEAN  = XSD + 'boolean',
      XSD_TRUE =  '"true"^^'  + XSD_BOOLEAN,
      XSD_FALSE = '"false"^^' + XSD_BOOLEAN;

  var base = '', basePath = '', baseRoot = '';

  // Returns a lowercase version of the given string
  function lowercase(string) {
    return string.toLowerCase();
  }

  // Appends the item to the array and returns the array
  function appendTo(array, item) {
    return array.push(item), array;
  }

  // Appends the items to the array and returns the array
  function appendAllTo(array, items) {
    return array.push.apply(array, items), array;
  }

  // Extends a base object with properties of other objects
  function extend(base) {
    if (!base) base = {};
    for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
      for (var name in arg)
        base[name] = arg[name];
    return base;
  }

  // Creates an array that contains all items of the given arrays
  function unionAll() {
    var union = [];
    for (var i = 0, l = arguments.length; i < l; i++)
      union = union.concat.apply(union, arguments[i]);
    return union;
  }

  // Resolves an IRI against a base path
  function resolveIRI(iri) {
    // Strip off possible angular brackets
    if (iri[0] === '<')
      iri = iri.substring(1, iri.length - 1);
    // Return absolute IRIs unmodified
    if (/^[a-z]+:/.test(iri))
      return iri;
    if (!Parser.base)
      throw new Error('Cannot resolve relative IRI ' + iri + ' because no base IRI was set.');
    if (!base) {
      base = Parser.base;
      basePath = base.replace(/[^\/:]*$/, '');
      baseRoot = base.match(/^(?:[a-z]+:\/*)?[^\/]*/)[0];
    }
    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined:
      return base;
    // Resolve relative fragment IRIs against the base IRI
    case '#':
      return base + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?':
      return base.replace(/(?:\?.*)?$/, iri);
    // Resolve root relative IRIs at the root of the base IRI
    case '/':
      return baseRoot + iri;
    // Resolve all other IRIs at the base IRI's path
    default:
      return basePath + iri;
    }
  }

  // If the item is a variable, ensures it starts with a question mark
  function toVar(variable) {
    if (variable) {
      var first = variable[0];
      if (first === '?') return variable;
      if (first === '$') return '?' + variable.substr(1);
    }
    return variable;
  }

  // Creates an operation with the given name and arguments
  function operation(operatorName, args) {
    return { type: 'operation', operator: operatorName, args: args || [] };
  }

  // Creates an expression with the given type and attributes
  function expression(expr, attr) {
    var expression = { expression: expr };
    if (attr)
      for (var a in attr)
        expression[a] = attr[a];
    return expression;
  }

  // Creates a path with the given type and items
  function path(type, items) {
    return { type: 'path', pathType: type, items: items };
  }

  // Transforms a list of operations types and arguments into a tree of operations
  function createOperationTree(initialExpression, operationList) {
    for (var i = 0, l = operationList.length, item; i < l && (item = operationList[i]); i++)
      initialExpression = operation(item[0], [initialExpression, item[1]]);
    return initialExpression;
  }

  // Group datasets by default and named
  function groupDatasets(fromClauses) {
    var defaults = [], named = [], l = fromClauses.length, fromClause;
    for (var i = 0; i < l && (fromClause = fromClauses[i]); i++)
      (fromClause.named ? named : defaults).push(fromClause.iri);
    return l ? { from: { default: defaults, named: named } } : null;
  }

  // Converts the number to a string
  function toInt(string) {
    return parseInt(string, 10);
  }

  // Transforms a possibly single group into its patterns
  function degroupSingle(group) {
    return group.type === 'group' && group.patterns.length === 1 ? group.patterns[0] : group;
  }

  // Creates a literal with the given value and type
  function createLiteral(value, type) {
    return '"' + value + '"^^' + type;
  }

  // Creates a triple with the given subject, predicate, and object
  function triple(subject, predicate, object) {
    var triple = {};
    if (subject   != null) triple.subject   = subject;
    if (predicate != null) triple.predicate = predicate;
    if (object    != null) triple.object    = object;
    return triple;
  }

  // Creates a new blank node identifier
  function blank() {
    return '_:b' + blankId++;
  };
  var blankId = 0;
  Parser._resetBlanks = function () { blankId = 0; }

  // Regular expression and replacement strings to escape strings
  var escapeSequence = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{8})|\\(.)/g,
      escapeReplacements = { '\\': '\\', "'": "'", '"': '"',
                             't': '\t', 'b': '\b', 'n': '\n', 'r': '\r', 'f': '\f' },
      fromCharCode = String.fromCharCode;

  // Translates escape codes in the string into their textual equivalent
  function unescapeString(string, trimLength) {
    string = string.substring(trimLength, string.length - trimLength);
    try {
      string = string.replace(escapeSequence, function (sequence, unicode4, unicode8, escapedChar) {
        var charCode;
        if (unicode4) {
          charCode = parseInt(unicode4, 16);
          if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
          return fromCharCode(charCode);
        }
        else if (unicode8) {
          charCode = parseInt(unicode8, 16);
          if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
          if (charCode < 0xFFFF) return fromCharCode(charCode);
          return fromCharCode(0xD800 + ((charCode -= 0x10000) >> 10), 0xDC00 + (charCode & 0x3FF));
        }
        else {
          var replacement = escapeReplacements[escapedChar];
          if (!replacement) throw new Error();
          return replacement;
        }
      });
    }
    catch (error) { return ''; }
    return '"' + string + '"';
  }

  // Creates a list, collecting its (possibly blank) items and triples associated with those items
  function createList(objects) {
    var list = blank(), head = list, listItems = [], listTriples, triples = [];
    objects.forEach(function (o) { listItems.push(o.entity); appendAllTo(triples, o.triples); });

    // Build an RDF list out of the items
    for (var i = 0, j = 0, l = listItems.length, listTriples = Array(l * 2); i < l;)
      listTriples[j++] = triple(head, RDF_FIRST, listItems[i]),
      listTriples[j++] = triple(head, RDF_REST,  head = ++i < l ? blank() : RDF_NIL);

    // Return the list's identifier, its triples, and the triples associated with its items
    return { entity: list, triples: appendAllTo(listTriples, triples) };
  }

  // Creates a blank node identifier, collecting triples with that blank node as subject
  function createAnonymousObject(propertyList) {
    var entity = blank();
    return {
      entity: entity,
      triples: propertyList.map(function (t) { return extend(triple(entity), t); })
    };
  }

  // Collects all (possibly blank) objects, and triples that have them as subject
  function objectListToTriples(predicate, objectList, otherTriples) {
    var objects = [], triples = [];
    objectList.forEach(function (l) {
      objects.push(triple(null, predicate, l.entity));
      appendAllTo(triples, l.triples);
    });
    return unionAll(objects, otherTriples || [], triples);
  }

  // Simplifies groups by merging adjacent BGPs
  function mergeAdjacentBGPs(groups) {
    var merged = [], currentBgp;
    for (var i = 0, group; group = groups[i]; i++) {
      switch (group.type) {
        // Add a BGP's triples to the current BGP
        case 'bgp':
          if (group.triples.length) {
            if (!currentBgp)
              appendTo(merged, currentBgp = group);
            else
              appendAllTo(currentBgp.triples, group.triples);
          }
          break;
        // All other groups break up a BGP
        default:
          // Only add the group if its pattern is non-empty
          if (!group.patterns || group.patterns.length > 0) {
            appendTo(merged, group);
            currentBgp = null;
          }
      }
    }
    return merged;
  }
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function(match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex () {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin (condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState () {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules () {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState (n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState (condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {"flex":true,"case-insensitive":true},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* ignore */
break;
case 1:return 12
break;
case 2:return 15
break;
case 3:return 24
break;
case 4:return 289
break;
case 5:return 290
break;
case 6:return 29
break;
case 7:return 31
break;
case 8:return 32
break;
case 9:return 292
break;
case 10:return 34
break;
case 11:return 38
break;
case 12:return 39
break;
case 13:return 41
break;
case 14:return 43
break;
case 15:return 48
break;
case 16:return 51
break;
case 17:return 295
break;
case 18:return 61
break;
case 19:return 62
break;
case 20:return 68
break;
case 21:return 71
break;
case 22:return 74
break;
case 23:return 76
break;
case 24:return 79
break;
case 25:return 81
break;
case 26:return 83
break;
case 27:return 182
break;
case 28:return 97
break;
case 29:return 296
break;
case 30:return 130
break;
case 31:return 297
break;
case 32:return 298
break;
case 33:return 107
break;
case 34:return 299
break;
case 35:return 106
break;
case 36:return 300
break;
case 37:return 301
break;
case 38:return 110
break;
case 39:return 112
break;
case 40:return 113
break;
case 41:return 128
break;
case 42:return 122
break;
case 43:return 123
break;
case 44:return 125
break;
case 45:return 131
break;
case 46:return 109
break;
case 47:return 302
break;
case 48:return 303
break;
case 49:return 157
break;
case 50:return 160
break;
case 51:return 164
break;
case 52:return 90
break;
case 53:return 158
break;
case 54:return 304
break;
case 55:return 163
break;
case 56:return 250
break;
case 57:return 186
break;
case 58:return 305
break;
case 59:return 306
break;
case 60:return 212
break;
case 61:return 308
break;
case 62:return 309
break;
case 63:return 207
break;
case 64:return 214
break;
case 65:return 215
break;
case 66:return 222
break;
case 67:return 226
break;
case 68:return 267
break;
case 69:return 310
break;
case 70:return 311
break;
case 71:return 312
break;
case 72:return 313
break;
case 73:return 314
break;
case 74:return 230
break;
case 75:return 315
break;
case 76:return 245
break;
case 77:return 253
break;
case 78:return 254
break;
case 79:return 247
break;
case 80:return 248
break;
case 81:return 249
break;
case 82:return 316
break;
case 83:return 317
break;
case 84:return 251
break;
case 85:return 319
break;
case 86:return 318
break;
case 87:return 320
break;
case 88:return 256
break;
case 89:return 257
break;
case 90:return 260
break;
case 91:return 262
break;
case 92:return 266
break;
case 93:return 270
break;
case 94:return 273
break;
case 95:return 274
break;
case 96:return 13
break;
case 97:return 16
break;
case 98:return 285
break;
case 99:return 217
break;
case 100:return 28
break;
case 101:return 269
break;
case 102:return 80
break;
case 103:return 271
break;
case 104:return 272
break;
case 105:return 279
break;
case 106:return 280
break;
case 107:return 281
break;
case 108:return 282
break;
case 109:return 283
break;
case 110:return 284
break;
case 111:return 'EXPONENT'
break;
case 112:return 275
break;
case 113:return 276
break;
case 114:return 277
break;
case 115:return 278
break;
case 116:return 165
break;
case 117:return 218
break;
case 118:return 6
break;
case 119:return 'INVALID'
break;
case 120:console.log(yy_.yytext);
break;
}
},
rules: [/^(?:\s+|#[^\n\r]*)/i,/^(?:BASE)/i,/^(?:PREFIX)/i,/^(?:SELECT)/i,/^(?:DISTINCT)/i,/^(?:REDUCED)/i,/^(?:\()/i,/^(?:AS)/i,/^(?:\))/i,/^(?:\*)/i,/^(?:CONSTRUCT)/i,/^(?:WHERE)/i,/^(?:\{)/i,/^(?:\})/i,/^(?:DESCRIBE)/i,/^(?:ASK)/i,/^(?:FROM)/i,/^(?:NAMED)/i,/^(?:GROUP)/i,/^(?:BY)/i,/^(?:HAVING)/i,/^(?:ORDER)/i,/^(?:ASC)/i,/^(?:DESC)/i,/^(?:LIMIT)/i,/^(?:OFFSET)/i,/^(?:VALUES)/i,/^(?:;)/i,/^(?:LOAD)/i,/^(?:SILENT)/i,/^(?:INTO)/i,/^(?:CLEAR)/i,/^(?:DROP)/i,/^(?:CREATE)/i,/^(?:ADD)/i,/^(?:TO)/i,/^(?:MOVE)/i,/^(?:COPY)/i,/^(?:INSERT\s+DATA)/i,/^(?:DELETE\s+DATA)/i,/^(?:DELETE\s+WHERE)/i,/^(?:WITH)/i,/^(?:DELETE)/i,/^(?:INSERT)/i,/^(?:USING)/i,/^(?:DEFAULT)/i,/^(?:GRAPH)/i,/^(?:ALL)/i,/^(?:\.)/i,/^(?:OPTIONAL)/i,/^(?:SERVICE)/i,/^(?:BIND)/i,/^(?:UNDEF)/i,/^(?:MINUS)/i,/^(?:UNION)/i,/^(?:FILTER)/i,/^(?:,)/i,/^(?:a)/i,/^(?:\|)/i,/^(?:\/)/i,/^(?:\^)/i,/^(?:\?)/i,/^(?:\+)/i,/^(?:!)/i,/^(?:\[)/i,/^(?:\])/i,/^(?:\|\|)/i,/^(?:&&)/i,/^(?:=)/i,/^(?:!=)/i,/^(?:<)/i,/^(?:>)/i,/^(?:<=)/i,/^(?:>=)/i,/^(?:IN)/i,/^(?:NOT)/i,/^(?:-)/i,/^(?:BOUND)/i,/^(?:BNODE)/i,/^(?:(RAND|NOW|UUID|STRUUID))/i,/^(?:(LANG|DATATYPE|IRI|URI|ABS|CEIL|FLOOR|ROUND|STRLEN|STR|UCASE|LCASE|ENCODE_FOR_URI|YEAR|MONTH|DAY|HOURS|MINUTES|SECONDS|TIMEZONE|TZ|MD5|SHA1|SHA256|SHA384|SHA512|isIRI|isURI|isBLANK|isLITERAL|isNUMERIC))/i,/^(?:(LANGMATCHES|CONTAINS|STRSTARTS|STRENDS|STRBEFORE|STRAFTER|STRLANG|STRDT|sameTerm))/i,/^(?:CONCAT)/i,/^(?:COALESCE)/i,/^(?:IF)/i,/^(?:REGEX)/i,/^(?:SUBSTR)/i,/^(?:REPLACE)/i,/^(?:EXISTS)/i,/^(?:COUNT)/i,/^(?:SUM|MIN|MAX|AVG|SAMPLE)/i,/^(?:GROUP_CONCAT)/i,/^(?:SEPARATOR)/i,/^(?:\^\^)/i,/^(?:true)/i,/^(?:false)/i,/^(?:(<([^<>\"\{\}\|\^`\\\u0000-\u0020])*>))/i,/^(?:((([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])(((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|\.)*(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]))?)?:))/i,/^(?:(((([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])(((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|\.)*(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]))?)?:)((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%)))))?)))/i,/^(?:(_:(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|[0-9])(((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|\.)*(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]))?))/i,/^(?:([\?\$]((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|[0-9])(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])*)))/i,/^(?:(@[a-zA-Z]+(-[a-zA-Z0-9]+)*))/i,/^(?:([0-9]+))/i,/^(?:([0-9]*\.[0-9]+))/i,/^(?:([0-9]+\.[0-9]*([eE][+-]?[0-9]+)|\.([0-9])+([eE][+-]?[0-9]+)|([0-9])+([eE][+-]?[0-9]+)))/i,/^(?:(\+([0-9]+)))/i,/^(?:(\+([0-9]*\.[0-9]+)))/i,/^(?:(\+([0-9]+\.[0-9]*([eE][+-]?[0-9]+)|\.([0-9])+([eE][+-]?[0-9]+)|([0-9])+([eE][+-]?[0-9]+))))/i,/^(?:(-([0-9]+)))/i,/^(?:(-([0-9]*\.[0-9]+)))/i,/^(?:(-([0-9]+\.[0-9]*([eE][+-]?[0-9]+)|\.([0-9])+([eE][+-]?[0-9]+)|([0-9])+([eE][+-]?[0-9]+))))/i,/^(?:([eE][+-]?[0-9]+))/i,/^(?:('(([^\u0027\u005C\u000A\u000D])|(\\[tbnrf\\\"']|\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/i,/^(?:("(([^\u0022\u005C\u000A\u000D])|(\\[tbnrf\\\"']|\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/i,/^(?:('''(('|'')?([^'\\]|(\\[tbnrf\\\"']|\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/i,/^(?:("""(("|"")?([^\"\\]|(\\[tbnrf\\\"']|\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/i,/^(?:(\((\u0020|\u0009|\u000D|\u000A)*\)))/i,/^(?:(\[(\u0020|\u0009|\u000D|\u000A)*\]))/i,/^(?:$)/i,/^(?:.)/i,/^(?:.)/i],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = SparqlParser;
exports.Parser = SparqlParser.Parser;
exports.parse = function () { return SparqlParser.parse.apply(SparqlParser, arguments); };
exports.main = function commonjsMain (args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,require('_process'))
},{"_process":1,"fs":1,"path":1}],4:[function(require,module,exports){
var Parser = require('./lib/SparqlParser').Parser;
var Generator = require('./lib/SparqlGenerator');

window.Nparser = Parser ;
window.Ngenerator = Generator ;
module.exports = {
  /**
   * Creates a SPARQL parser with the given pre-defined prefixes and base IRI
   * @param prefixes { [prefix: string]: string }
   * @param baseIRI string
   */
  Parser: function (prefixes, baseIRI) {
    // Create a copy of the prefixes
    var prefixesCopy = {};
    for (var prefix in prefixes || {})
      prefixesCopy[prefix] = prefixes[prefix];

    // Create a new parser with the given prefixes
    // (Workaround for https://github.com/zaach/jison/issues/241)
    var parser = new Parser();
    parser.parse = function () {
      Parser.base = baseIRI || '';
      Parser.prefixes = Object.create(prefixesCopy);
      return Parser.prototype.parse.apply(parser, arguments);
    };
    parser._resetBlanks = Parser._resetBlanks;
    return parser;
  },
  Generator: Generator,
};

},{"./lib/SparqlGenerator":2,"./lib/SparqlParser":3}]},{},[4])(4)
});
