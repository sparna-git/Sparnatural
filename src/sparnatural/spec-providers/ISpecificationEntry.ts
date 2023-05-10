import { Config } from "../ontologies/SparnaturalConfig";


export default interface ISpecificationEntry {

    /**
     * @returns The id (if JSON-LD) or URI of the entry
     */
    getId():string;

    getLabel(): string;
    getTooltip(): string|null;

    getDatasource(): any;
    getTreeChildrenDatasource(): any;
    getTreeRootsDatasource(): any;

    getIcon(): string;
    getHighlightedIcon(): string;
}
