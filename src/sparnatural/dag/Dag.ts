
export class Dag<Payload> implements DagIfc<Payload> {
    roots:DagNodeIfc<Payload>[];

    constructor() {
        this.roots = new Array<DagNodeIfc<Payload>>();
    }

    toDebugString():string {
        let result = "";
        this.roots.forEach(root => {
            result += root.toDebugString(0);
        })
        return result;
    }

    /**
     * Creates a DAG from a map giving the relationship between a node and its parent, and a data map containing the payload
     * for each ID.
     * @param hierarchy The map containing the hierarchy information 
     * @param data The map containing the payload information
     */
    initFromFlatList(hierarchy: Map<string, string[]>, data:Map<string, Payload>, disabled:string[]): void {
        this.roots = new Array<DagNode<Payload>>();

        // Create all nodes
        const nodes: Map<string, DagNode<Payload>> = new Map();
        for (const [id, parentIds] of hierarchy.entries()) {
            if (!nodes.has(id)) {
                nodes.set(id, new DagNode(id, data.get(id)));
            }
            if (parentIds !== null) {
                parentIds.forEach(parentId => {
                    if(!nodes.has(parentId)) {
                        nodes.set(parentId, new DagNode(parentId, data.get(parentId)));
                    }
                })
            }
        }

        // set disabled nodes
        for(const id of disabled) {
            nodes.get(id).disabled = true;
        }

        // Establish parent-child relationships
        for (const [id, parentIds] of hierarchy.entries()) {
            const currentNode = nodes.get(id)!;

            // no parents, it's a root
            if(parentIds === null || parentIds.length == 0)
                this.roots.push(currentNode);
            else {
                parentIds.forEach(parentId => {
                    const parentNode = nodes.get(parentId)!;
                    // addUnder and not moveUnder, otherwise the existing parent would be reset
                    currentNode.addUnder(parentNode);
                })                
            }
        }
    }

    /**
     * A simple method to create a Dag from a map containing the hierarchy, and an array of items that are the payload
     * and that have a getId() method to retrieve their ID
     * @param hierarchy the map containing the hierarchy (id <-> list of parent ids)
     * @param data the array containing the payload objects, each with a getId() function
     */
    initFromIdableEntity(hierarchy: Map<string, string[]>, data:Array<Payload & {getId():string}>): void {
        let dataMap:Map<string, Payload> = new Map<string, Payload>();
        data.forEach((item)=> {
            dataMap.set(item.getId(), item);
        });
        

        this.initFromFlatList(hierarchy, dataMap, new Array<string>());
    }

    /**
     * A simple method to create a Dag from only an array of items that are the payload
     * and that have a getId() method to retrieve their ID, and a getParents() methods to retrieve their parents
     * @param data the array containing the payload objects, each with a getId() function and a getParents() function
     */
    initFromParentableAndIdAbleEntity(data:Array<Payload & {getId():string} & {getParents():string[]}>, disabled:string[]): void {
        let dataMap:Map<string, Payload> = new Map<string, Payload>();
        data.forEach((item)=> {
            dataMap.set(item.getId(), item);
        });
        let hierarchyMap:Map<string, string[]> = new Map<string, string[]>();
        data.forEach((item)=> {
            hierarchyMap.set(item.getId(), item.getParents());
        });

        this.initFromFlatList(hierarchyMap, dataMap, disabled);
    }

    initFlatTreeFromFlatList(data:Array<Payload & {getId():string}>): void {
        let dataMap:Map<string, Payload> = new Map<string, Payload>();
        data.forEach((item)=> {
            dataMap.set(item.getId(), item);
        });
        // empty hierarchy map
        let hierarchyMap:Map<string, string[]> = new Map<string, string[]>();
        data.forEach((item)=> {
            hierarchyMap.set(item.getId(), []);
        });

        this.initFromFlatList(hierarchyMap, dataMap, new Array<string>());
    }

    public traverseBreadthFirst(processor: (node: DagNodeIfc<Payload>) => void) {
        this.roots.forEach(root => {
            processor(root);
        })
        this.roots.forEach(root => {
            root.traverseBreadthFirst(processor);
        })
    }

    public traverseDepthFirst(processor: (node: DagNodeIfc<Payload>) => void) {
        this.roots.forEach(root => {
            processor(root);
            root.traverseBreadthFirst(processor);
        })
    }

    public sort(compareFn: (a:Payload, b:Payload) => number) {
        // when sorting the children array, sort their payload
        this.roots.sort((a:DagNodeIfc<Payload>, b:DagNodeIfc<Payload>) => {
            return compareFn(a.payload, b.payload);
        });
        // then sort recursively
        this.roots.forEach(c => c.sort(compareFn));
    }
    
}

export class DagNode<Payload> implements DagNodeIfc<Payload> {
    public id: string;
    // never null
    public parents: DagNodeIfc<Payload>[];
    // never null
    public children: DagNodeIfc<Payload>[];
    public disabled: boolean;
    public payload: Payload;

    constructor(id: string, payload: Payload) {
        this.id = id;
        this.payload = payload;
        this.parents = new Array<DagNodeIfc<Payload>>();
        this.children = new Array<DagNodeIfc<Payload>>();
    }

    /**
     * Adds this node under a new parent. Existing parents are kept
     * @param parent the new parent or null to set a root node
     */
    public addUnder(parent:DagNodeIfc<Payload>|null) {
        // link with parent if a parent was given    
        if(parent) {
            this.parents.push(parent);          
            parent.children.push(this);
        }
    }


    /**
     * Moves this node under a new parent. This will unlink the node from its existing parents
     * @param parent the new parent or null to set a root node
     */
    public moveUnder(parent:DagNodeIfc<Payload>|null) {

        // unlink from current parents
        let theId = this.id;
        this.parents.forEach(p => {
            p.children = p.children.filter(n => n.id != theId);
        })

        // reset parents
        this.parents = new Array<DagNodeIfc<Payload>>();
        // then add it under new parent
        this.addUnder(parent);
    }


    public sort(compareFn: (a:Payload, b:Payload) => number) {
        // when sorting the children array, sort their payload
        this.children.sort((a:DagNodeIfc<Payload>, b:DagNodeIfc<Payload>) => {
            return compareFn(a.payload, b.payload);
        });
        // then sort recursively
        this.children.forEach(c => c.sort(compareFn));
    }

    toDebugString(depth:number):string {
        let indent = "";
        for (let i = 0; i < depth; i++) {
            indent += " ";            
        }
        let result = indent+"id:"+this.id+(this.disabled?" !disabled":"")+"\n";
        this.children.forEach(child => {
            result += child.toDebugString(depth+2);
        })
        return result;
    }

    public traverseBreadthFirst(processor: (node: DagNodeIfc<Payload>) => void) {
        this.children.forEach(c => {
            processor(c);
        })
        this.children.forEach(c => {
            c.traverseBreadthFirst(processor);
        })
    }

    public traverseDepthFirst(processor: (node: DagNodeIfc<Payload>) => void) {
        this.children.forEach(c => {
            processor(c);
            c.traverseBreadthFirst(processor);
        })
    }
}

/**
 * A node in a DAG. Just like a tree node, but with multiple parents
 */
export interface DagNodeIfc<Payload> {
    id: string;
    parents:DagNodeIfc<Payload>[];
    children:DagNodeIfc<Payload>[];
    disabled:boolean;
    payload:Payload;
    count?:number;

    toDebugString(depth:number):string;

    sort: (compareFn:(a:Payload, b:Payload)=> number) => void;

    traverseBreadthFirst: (processor:(node:DagNodeIfc<Payload>) => void) => void;
    traverseDepthFirst: (processor:(node:DagNodeIfc<Payload>) => void) => void;
}

/**
 * Directed Acyclic Graph
 */
export interface DagIfc<Payload> {
    roots:DagNodeIfc<Payload>[];

    toDebugString():string;

    sort: (compareFn:(a:Payload, b:Payload)=> number) => void;

    traverseBreadthFirst: (processor:(node:DagNodeIfc<Payload>) => void) => void;
    traverseDepthFirst: (processor:(node:DagNodeIfc<Payload>) => void) => void;
}