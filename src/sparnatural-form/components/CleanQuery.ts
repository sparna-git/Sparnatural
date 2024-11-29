import { ISparJson } from "../../sparnatural/generators/json/ISparJson";

//!!
//!!
//!!
// working on this class not finished yet !!

/**
 * Clean the query to remove any unnecessary information
/**
 * @param query : the query to clean
 * from query to use remove the branchs with o that exist on the form varibales 
 * the condition is that the o haven't any values not exist in query.variables and it's optional or his father is optional
 * @returns the cleaned query 
 */

class CleanQuery {
  private query: ISparJson;
  private cleanQueryResult: ISparJson;

  constructor(query: ISparJson) {
    this.query = query;
  }

  //get the form vaiables from the form.json
  getformVariables(): string[] {
    return;
  }

  //metthods to clean the querytouse
  cleandQueryToUse(): ISparJson {
    this.cleanQueryResult = this.query;
    //focus on form variables to remove the branches with o that exist on the form varibales
    const formVariables = this.getformVariables();

    //remove the branches with o that exist on the form varibales which haven't any values not exist in query.variables and it's optional or his father is optional focus on formVariables and don't touch the other branches

    return this.cleanQueryResult;
  }
}
export default CleanQuery;
