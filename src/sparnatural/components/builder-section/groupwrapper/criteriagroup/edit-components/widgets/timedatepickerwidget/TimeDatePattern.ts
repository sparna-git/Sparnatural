import { DataFactory, Literal, NamedNode, Variable } from "n3"
import { OperationExpression, UnionPattern } from "sparqljs"


export const getTimeDatePattern = (startDate:Literal,endDate:Literal,startClassVar:Variable,beginDatePred:NamedNode,endDatePred:NamedNode,exactDatePred:NamedNode,variableNumber:number): UnionPattern => {return  {
    type: "union",
    patterns: [
        {
            type: "group",
            patterns: [
                { 
                    type: "filter",
                    expression: <OperationExpression>{
                        type: "operation",
                        operator: "&&",
                        args: [
                            {
                                type: "operation",
                                operator: ">=",
                                args: [
                                    {
                                        type: "functioncall",
                                        function: DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#dateTime"),
                                        args: [
                                            DataFactory.variable("Date_1_exact")
                                        ]
                                    },
                                    startDate
                                ]
                            },
                            {
                                type: "operation",
                                operator: "<=",
                                args: [
                                    {
                                        type: "functioncall",
                                        function: DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#dateTime"),
                                        args: [
                                            DataFactory.variable("Date_1_exact")
                                        ]
                                    },
                                    endDate
                                ]
                            }
                        ]
                    }
                },
                {
                    type: "bgp",
                    triples: [
                        {
                            subject: startClassVar ,
                            predicate: exactDatePred,
                            object: DataFactory.variable(`Date_${variableNumber}_exact`)
                        }
                    ]
                }
            ]
        },
        {
            type: "group",
            patterns: [
                {
                    type: "union",
                    patterns: [
                        {
                            type: "group",
                            patterns: [
                                {
                                    type: "bgp",
                                    triples: [
                                        {
                                            subject: startClassVar,
                                            predicate: beginDatePred,
                                            object: DataFactory.variable(`Date_${variableNumber}_begin`)
                                        },
                                        {
                                            subject: startClassVar,
                                            predicate: exactDatePred,
                                            object: DataFactory.variable(`Date_${variableNumber}_end`)
                                        }
                                    ]
                                },
                                {
                                    type: "filter",
                                    expression:<OperationExpression> {
                                        type: "operation",
                                        operator: "<=",
                                        args: [
                                            {
                                                type: "functioncall",
                                                function: DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#dateTime"),
                                                args: [
                                                    DataFactory.variable(`Date_${variableNumber}_begin`)
                                                ]
                                            },
                                            endDate
                                        ]
                                    }
                                },
                                {
                                    type: "filter",
                                    expression:<OperationExpression> {
                                        type: "operation",
                                        operator: ">=",
                                        args: [
                                            {
                                                type: "functioncall",
                                                function: DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#dateTime"),
                                                args: [
                                                    DataFactory.variable(`Date_${variableNumber}_end`)
                                                ]
                                            },
                                            startDate
                                        ]
                                    }
                                }
                            ]
                        },
                        {
                            type: "group",
                            patterns: [
                                {
                                    type: "bgp",
                                    triples: [
                                        {
                                            subject: startClassVar,
                                            predicate: beginDatePred,
                                            object: DataFactory.variable(`Date_${variableNumber}_begin`)
                                        }
                                    ]
                                },
                                {
                                    type: "filter",
                                    expression: <OperationExpression>{
                                        type: "operation",
                                        operator: "notexists",
                                        args: [
                                            {
                                                type: "group",
                                                patterns: [
                                                    {type:'bgp',
                                                    triples:[{
                                                        subject: startClassVar, //replace with startClassVal.variable.fullname
                                                        predicate: endDatePred,
                                                        object: DataFactory.variable(`Date_${variableNumber}_end`)
                                                    }]
                                                }
                                                ]
                                            }
                                        ]
                                    }
                                },
                                {
                                    type: "filter",
                                    expression: <OperationExpression>{
                                        type: "operation",
                                        operator: "<=",
                                        args: [
                                            {
                                                type: "functioncall",
                                                function: DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#dateTime"),
                                                args: [
                                                    DataFactory.variable(`Date_${variableNumber}_begin`)
                                                ]
                                            },
                                            endDate
                                        ]
                                    }
                                }
                            ]
                        },
                        {
                            type: "group",
                            patterns: [
                                {
                                    type: "bgp",
                                    triples: [
                                        {
                                            subject: startClassVar,
                                            predicate:endDatePred,
                                            object: DataFactory.variable(`Date_${variableNumber}_end`)
                                        }
                                    ]
                                },
                                {
                                    type: "filter",
                                    expression: <OperationExpression>{
                                        type: "operation",
                                        operator: "notexists",
                                        args: [
                                            {
                                                type: "group",
                                                patterns: [
                                                    {type: 'bgp',
                                                    triples:[
                                                        {
                                                            subject: startClassVar, 
                                                            predicate:beginDatePred,
                                                            object: DataFactory.variable(`Date_${variableNumber}_begin`)
                                                        }
                                                    ]
                                                }
                                                ]
                                            }
                                        ]
                                    }
                                },
                                {
                                    type: "filter",
                                    expression: <OperationExpression>{
                                        type: "operation",
                                        operator: ">=",
                                        args: [
                                            {
                                                type: "functioncall",
                                                function: DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#dateTime"),
                                                args: [
                                                    DataFactory.variable(`Date_${variableNumber}_end`)
                                                ]
                                            },
                                            startDate
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}
}