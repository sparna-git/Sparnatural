import {
    BooleanValue,
    DateTimeValue,
    ExactStringValue,
    LiteralValue,
    LuceneQueryValue,
    Query,
    QueryBranch,
    QueryLine,
    RegexValue,
    URIValue,
  } from "./Query";
  
  var SparqlGenerator = require("sparqljs").Generator;
  // var SparqlParser = require('sparqljs').Parser;
  
import { Config } from "../../configs/fixed-configs/SparnaturalConfig";
import Sparnatural from "../components/MainComponents/Sparnatural";
import GroupWrapper from "../components/groupwrapper/GroupWrapper";
import { Branch, ISparJson, Language, Order,SelectedVal } from "./ISparJson";
import StartClassGroup from "../components/startendclassgroup/StartClassGroup";
  
  class NewJSONQueryGenerator {
    sparnatural: Sparnatural;
    json: ISparJson
    constructor(sparnatural:Sparnatural) {
        this.sparnatural = sparnatural
    }


    generateQueryi(variables:Array<SelectedVal>,distinct:boolean,order:Order,lang:Language){
        let index = 0
        this.json.distinct = distinct
        this.json.variables = variables
        this.json.order = order
        this.json.lang = lang
        this.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traverse(
            (grpWrapper: GroupWrapper) => {
                let CrtGrp = grpWrapper.CriteriaGroup
                let branch:Branch = {
                    line: {
                       s:CrtGrp.StartClassGroup.getVarName(),
                       p:CrtGrp.ObjectPropertyGroup.objectPropVal,
                       o:CrtGrp.EndClassGroup.getVarName(),
                       sType:CrtGrp.StartClassGroup.getTypeSelected(),
                       oType:CrtGrp.EndClassGroup.getTypeSelected(),
                       values:CrtGrp.EndClassGroup.endClassWidgetGroup.selectedValues 
                    },
                    children: []
                }
            }
        );
    }
    /**
     * Generates a JSON query
     **/
    generateQuery(formObject: {
      queryOptions: any;
      sparnatural: { components: string | any[] };
    }) {
      if (this.hasEnoughCriteria(formObject)) {
        var query = new Query(formObject.queryOptions);
  
        for (var i = 0; i < formObject.sparnatural.components.length; i++) {
          var component = formObject.sparnatural.components[i];
          var dependantDe = this.findDependantCriteria(formObject, i);
          // at first level of the query, we have either no dependant criteria for the first lin
          // of type = sibling
          // at other level, the type is always "parent"
          if (dependantDe == null || dependantDe.type == "sibling") {
            var branch = this.generateBranch(formObject, component, i);
            query.branches.push(branch);
          }
        }
  
        // console.log(query) ;
  
        return query;
      } else {
        return null;
      }
    }
  
    generateBranch(
      formObject: { queryOptions?: any; sparnatural: any },
      component: {
        CriteriaGroup: {
          StartClassGroup: { value_selected: any; getVarName: () => any };
          ObjectPropertyGroup: { value_selected: any };
          EndClassGroup: { value_selected: any; getVarName: () => any };
          OptionsGroup: { valuesSelected: { [x: string]: boolean } };
          EndClassWidgetGroup: {
            selectedValues: string | any[];
            inputTypeComponent: { widgetType: any };
          };
        };
      },
      i: number
    ) {
      var branch = new QueryBranch();
  
      var domainClass = component.CriteriaGroup.StartClassGroup.value_selected;
      var property = component.CriteriaGroup.ObjectPropertyGroup.value_selected;
      var rangeClass = component.CriteriaGroup.EndClassGroup.value_selected;
  
      branch.optional =
        component.CriteriaGroup.OptionsGroup.valuesSelected["optional"];
      branch.notExists =
        component.CriteriaGroup.OptionsGroup.valuesSelected["notExists"];
  
      // name start and end variables
      // dashes should be replaced
      var subjectVariable = component.CriteriaGroup.StartClassGroup.getVarName();
      if (i == 0) {
        if (subjectVariable == null) {
          subjectVariable = "?this";
        }
      }
  
      var objectVariable = null;
      if (rangeClass != null) {
        objectVariable = component.CriteriaGroup.EndClassGroup.getVarName();
      }
  
      var line = new QueryLine(
        subjectVariable,
        domainClass,
        property,
        rangeClass,
        objectVariable
      );
  
      // Set the values based on widget type
      var _WidgetType =
        component.CriteriaGroup?.EndClassWidgetGroup?.inputTypeComponent
          ?.widgetType;
      if (
        component.CriteriaGroup.EndClassWidgetGroup.selectedValues?.length > 0
      ) {
        // IMPORTANT see if the introduced null check still has the same effect
        switch (_WidgetType) {
          case Config.TREE_PROPERTY:
          case Config.LIST_PROPERTY:
          case Config.AUTOCOMPLETE_PROPERTY:
            for (var key in component.CriteriaGroup.EndClassWidgetGroup
              .selectedValues as Array<any>) {
              var selectedValue =
                component.CriteriaGroup.EndClassWidgetGroup.selectedValues[key];
              line.values.push(
                new URIValue(selectedValue.uri, selectedValue.label)
              );
            }
            break;
          case Config.LITERAL_LIST_PROPERTY:
            for (var key in component.CriteriaGroup.EndClassWidgetGroup
              .selectedValues as Array<any>) {
              // TODO : we use the same key 'uri' but this is a literal
              var selectedValue =
                component.CriteriaGroup.EndClassWidgetGroup.selectedValues[key];
              line.values.push(
                new LiteralValue(selectedValue.uri, selectedValue.label)
              );
            }
            break;
          case Config.TIME_PROPERTY_PERIOD:
          case Config.TIME_PROPERTY_YEAR:
          case Config.TIME_PROPERTY_DATE:
            for (var key in component.CriteriaGroup.EndClassWidgetGroup
              .selectedValues as Array<any>) {
              var selectedValue =
                component.CriteriaGroup.EndClassWidgetGroup.selectedValues[key];
              line.values.push(
                new DateTimeValue(
                  selectedValue.start,
                  selectedValue.stop,
                  selectedValue.label
                )
              );
            }
            break;
          case Config.SEARCH_PROPERTY:
            var value =
              component.CriteriaGroup.EndClassWidgetGroup.selectedValues[0]
                .search;
            line.values.push(new RegexValue(value, value));
            break;
          case Config.GRAPHDB_SEARCH_PROPERTY:
            var value =
              component.CriteriaGroup.EndClassWidgetGroup.selectedValues[0]
                .search;
            line.values.push(new LuceneQueryValue(value, value));
            break;
          case Config.STRING_EQUALS_PROPERTY:
            var value =
              component.CriteriaGroup.EndClassWidgetGroup.selectedValues[0]
                .search;
            line.values.push(new ExactStringValue(value, value));
            break;
          case Config.BOOLEAN_PROPERTY:
            var selectedValue =
              component.CriteriaGroup.EndClassWidgetGroup.selectedValues[0];
            line.values.push(
              new BooleanValue(selectedValue.boolean, selectedValue.label)
            );
            break;
          default:
            console.log(
              "Unknown widget type when generating SPARQL : " + _WidgetType
            );
        }
      }
  
      // hook the line to the branch
      branch.line = line;
  
      // now find "children" branches
      for (var j = 0; j < formObject.sparnatural.components.length; j++) {
        var parentOfJ = this.findDependantCriteria(formObject, j);
        // not sure I should compare on id - is it equal to the index of the component ?
        if (
          parentOfJ != null &&
          parentOfJ.type == "parent" &&
          parentOfJ.element.id == i
        ) {
          //IMPORTANT parentOfJ unused?
          branch.children.push(
            // recursive call
            this.generateBranch(
              formObject,
              formObject.sparnatural.components[j],
              j
            )
          );
        }
      }
  
      return branch;
    }
  
    hasEnoughCriteria(formObject: { queryOptions?: any; sparnatural: any }) {
      for (var i = 0; i < formObject.sparnatural.components.length; i++) {
        // if there is no value selected and the widget required one
        // do not process this component
        if (
          //($.inArray(formObject.sparnatural.components[i].CriteriaGroup.EndClassWidgetGroup.inputTypeComponent.widgetType, WIDGETS_REQUIRING_VALUES) > -1)
  
          //($.inArray(formObject.sparnatural.components[i].CriteriaGroup.EndClassWidgetGroup.inputTypeComponent.widgetType,[]) > -1)
          //&&
          formObject.sparnatural.components[i]?.CriteriaGroup?.EndClassWidgetGroup
            ?.selectedValues?.length === 0 // IMPORTANT see if the introduced null check still has the same effect
        ) {
          continue;
        } else {
          // we will have at least one component with a criteria
          return true;
        }
      }
  
      // not enough criteria found.
      return false;
    }
  
    findDependantCriteria(
      thisForm_: { queryOptions?: any; sparnatural: any },
      id: string | number
    ) {
      var dependant: { element?: any; type: string } = null;
      var dep_id: string = null;
      var element = $(thisForm_.sparnatural).find('li[data-index="' + id + '"]');
  
      if ($(element).parents("li").length > 0) {
        dep_id = $($(element).parents("li")[0]).attr("data-index");
        dependant = { type: "parent" };
      } else {
        if ($(element).prev().length > 0) {
          dep_id = $(element).prev().attr("data-index");
          dependant = { type: "sibling" };
        }
      }
  
      $(thisForm_.sparnatural.components).each(function (index) {
        if (this.index == dep_id) {
          dependant.element = this.CriteriaGroup;
        }
      });
  
      return dependant;
    }
  }
  
  export default NewJSONQueryGenerator;
  