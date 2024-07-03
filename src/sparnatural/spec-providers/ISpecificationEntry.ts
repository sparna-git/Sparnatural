import { Config } from "../ontologies/SparnaturalConfig";


export default interface ISpecificationEntry {

    /**
     * @returns The id (if JSON-LD) or URI of the entry
     */
    getId():string;

    getLabel(): string;
    getTooltip(): string|undefined;

    getIcon(): string;
    getHighlightedIcon(): string|undefined;

    getColor(): string|undefined;

    getOrder(): string|undefined;

    /**
     * Returns the parents entries of this one. Usually there is only one such parent.
     * Returns an empty array if there are no such parents (root entry)
     */
    getParents():Array<string>;
}
