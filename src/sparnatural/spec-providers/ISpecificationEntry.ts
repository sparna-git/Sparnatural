import { Config } from "../ontologies/SparnaturalConfig";


export default interface ISpecificationEntry {

    getId():string;

    getLabel(): string;
    getTooltip(): string|null;

    getDatasource(): any;
    getTreeChildrenDatasource(): any;
    getTreeRootsDatasource(): any;

    getIcon(): string;
    getHighlightedIcon(): string;
}
